import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { journeyManifest } from "@/lib/journey/loader";
import { maxEarnable, STARTING_COINS } from "@/lib/journey/economy";
import { isLiveTrack } from "@/lib/tracks";

const BodySchema = z.object({
  tracks: z.record(
    z.string(),
    z.object({
      levelsCompleted: z.number().int().min(0).max(500),
      bonusFound: z.number().int().min(0).max(5000),
      hintsUsed: z.number().int().min(0).max(5000).optional(),
    }),
  ),
  coins: z.number().int().min(0).max(100_000),
});

// One-shot merge of guest (localStorage) progress after first login. Only
// runs while the server side is still fresh; everything is clamped to what
// a legitimate player could have earned. Coins are cosmetic — clamping is
// enough, forgery isn't worth more machinery.
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

  const admin = adminClient();
  const [{ data: progressRows }, { data: wallet }] = await Promise.all([
    admin
      .from("journey_progress")
      .select("levels_completed")
      .eq("user_id", user.id),
    admin
      .from("journey_wallets")
      .select("lifetime_coins")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const serverFresh =
    (progressRows ?? []).every((r) => r.levels_completed === 0) &&
    (wallet?.lifetime_coins ?? 0) <= STARTING_COINS;
  if (!serverFresh) {
    return NextResponse.json({ error: "already_synced" }, { status: 409 });
  }

  const now = new Date().toISOString();
  let totalLevels = 0;
  let totalBonus = 0;
  let totalChapters = 0;

  for (const [track, p] of Object.entries(parsed.data.tracks)) {
    if (!isLiveTrack(track)) continue;
    const entry = journeyManifest.tracks[track];
    if (!entry) continue;
    const levels = Math.min(p.levelsCompleted, entry.totalLevels);
    // generous per-level bonus bound; exact per-level sums aren't worth it
    const bonus = Math.min(p.bonusFound, levels * 25);
    let chapters = 0;
    let offset = 0;
    for (const ch of entry.chapters) {
      offset += ch.levelCount;
      if (levels >= offset) chapters++;
    }
    totalLevels += levels;
    totalBonus += bonus;
    totalChapters += chapters;

    const { error } = await admin.from("journey_progress").upsert({
      user_id: user.id,
      track_code: track,
      levels_completed: levels,
      bonus_words_found: bonus,
      hints_used: Math.min(p.hintsUsed ?? 0, levels * 5),
      imported_at: now,
      updated_at: now,
    });
    if (error) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  }

  const coins = Math.min(
    parsed.data.coins,
    maxEarnable(totalLevels, totalBonus, totalChapters),
  );
  const { error: walletErr } = await admin.from("journey_wallets").upsert({
    user_id: user.id,
    coins,
    lifetime_coins: coins,
    updated_at: now,
  });
  if (walletErr) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, coins });
}
