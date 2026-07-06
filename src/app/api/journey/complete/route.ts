import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ensureWallet } from "@/lib/journey/db";
import { addressOf, loadChapter } from "@/lib/journey/loader";
import {
  BONUS_WORD_REWARD,
  CHAPTER_REWARD,
  LEVEL_REWARD,
} from "@/lib/journey/economy";
import { isLiveTrack } from "@/lib/tracks";
import { sastToday, sastYesterday } from "@/lib/time";
import { journeyActionQualifies } from "@/lib/streak/streak";
import { logEvent } from "@/lib/events";

const BodySchema = z.object({
  track: z.string(),
  level: z.number().int().min(1), // global 1-based level number
  bonusFound: z.number().int().min(0).max(100),
  hintsUsed: z.number().int().min(0).max(60),
});

// Ledger write for a completed level. Awards coins only for the next
// sequential level (replays and URL-jumps complete client-side but pay
// nothing); bonus count is clamped against the level's actual bonus list.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { track, level, bonusFound, hintsUsed } = parsed.data;
  if (!isLiveTrack(track)) {
    return NextResponse.json({ error: "unknown_track" }, { status: 404 });
  }
  const addr = addressOf(track, level);
  if (!addr) {
    return NextResponse.json({ error: "unknown_level" }, { status: 404 });
  }

  const admin = adminClient();
  const { data: row, error: rowErr } = await admin
    .from("journey_progress")
    .select("levels_completed, bonus_words_found, hints_used")
    .eq("user_id", user.id)
    .eq("track_code", track)
    .maybeSingle();
  if (rowErr) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  const current = row?.levels_completed ?? 0;

  if (level !== current + 1) {
    // replay or out-of-order: acknowledge, award nothing
    return NextResponse.json({
      awarded: 0,
      levelsCompleted: current,
      coins: null,
    });
  }

  const levels = await loadChapter(track, addr.chapterIndex);
  const levelData = levels?.[addr.levelInChapter - 1];
  if (!levelData) {
    return NextResponse.json({ error: "unknown_level" }, { status: 404 });
  }
  const clampedBonus = Math.min(bonusFound, levelData.bonus.length);
  const award =
    LEVEL_REWARD +
    clampedBonus * BONUS_WORD_REWARD +
    (addr.isLastInChapter ? CHAPTER_REWARD : 0);

  if (row) {
    const { data: updated, error } = await admin
      .from("journey_progress")
      .update({
        levels_completed: level,
        bonus_words_found: row.bonus_words_found + clampedBonus,
        hints_used: row.hints_used + hintsUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("track_code", track)
      .eq("levels_completed", current) // optimistic lock vs double submit
      .select("levels_completed");
    if (error || !updated || updated.length === 0) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
  } else {
    const { error } = await admin.from("journey_progress").insert({
      user_id: user.id,
      track_code: track,
      levels_completed: level,
      bonus_words_found: clampedBonus,
      hints_used: hintsUsed,
    });
    if (error) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
  }

  await ensureWallet(user.id);
  const { data: coins, error: awardErr } = await admin.rpc(
    "award_journey_coins",
    { p_user: user.id, p_amount: award },
  );
  if (awardErr) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Unified cross-mode streak (RFC-0001): a genuine new level advances the SAME
  // profile streak as a daily-puzzle solve, via the same atomic function. Only
  // reached on real progress (level === current + 1, award > 0), so replays and
  // out-of-order jumps — which returned above with awarded: 0 — never tick it.
  let streak: number | null = null;
  let shields: number | null = null;
  let shieldUsed = false;
  if (journeyActionQualifies(award)) {
    const { data: streakRows, error: streakErr } = await admin.rpc(
      "update_streak_on_solve",
      { p_user: user.id, p_today: sastToday(), p_yesterday: sastYesterday() },
    );
    if (!streakErr && streakRows && streakRows.length > 0) {
      streak = streakRows[0].current_streak;
      shields = streakRows[0].shields_remaining;
      shieldUsed = streakRows[0].shield_used;
      // Same guardrail event as the daily route — a shield saved the streak,
      // this time via Journey (RFC-0002, TELEMETRY.md).
      if (shieldUsed) {
        await logEvent("streak_shield_used", {
          userId: user.id,
          track,
          props: {
            mode: "journey",
            streak: streak ?? 0,
            shields_remaining: streakRows[0].shields_remaining,
          },
        });
      }
    }
    // A streak-write failure must not fail the (already-committed) completion;
    // the streak is best-effort here, exactly as in the daily-guess route.
  }

  return NextResponse.json({
    awarded: award,
    levelsCompleted: level,
    coins,
    streak,
    shields,
    shieldUsed,
  });
}
