// Draw execution. Takes a service-role SupabaseClient as a parameter (no
// 'server-only' import) so both the cron route and tsx scripts can use it.

import type { SupabaseClient } from "@supabase/supabase-js";
import { DRAW_ALGORITHM, newSeed } from "./rng";
import { selectWinners, sortEntrants, type Entrant } from "./select";
import { sastMonthStartIso, sastToday } from "../time";

const DAILY_BASE_WINNERS = 2;
const WEEKLY_WINNERS = 1;
const PRIZE_CENTS = 2900;
const CLAIM_WINDOW_HOURS = 72;
const MONTHLY_WIN_CAP = 2;
const STREAK_THRESHOLD = 7;

interface DrawOutcome {
  ran: boolean;
  reason?: string;
  drawId?: number;
  entrantCount?: number;
  winners?: string[];
}

async function audit(
  supabase: SupabaseClient,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await supabase.from("audit_log").insert({ actor: "cron", action, payload });
}

/**
 * Expire overdue unclaimed prizes. Returns how many expired in this sweep —
 * their value rolls into today's daily draw as extra winners.
 */
export async function expireOverduePrizes(
  supabase: SupabaseClient,
): Promise<number> {
  const { data, error } = await supabase
    .from("prizes")
    .update({ status: "expired" })
    .eq("status", "pending_claim")
    .lt("expires_at", new Date().toISOString())
    .select("id");
  if (error) throw new Error(`expireOverduePrizes: ${error.message}`);
  const count = data?.length ?? 0;
  if (count > 0) {
    await audit(supabase, "expire_prizes", {
      expired: count,
      prize_ids: data!.map((p) => p.id),
    });
  }
  return count;
}

/** Users at the monthly win cap (counts non-expired prizes this SAST month). */
async function cappedUsers(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("prizes")
    .select("user_id")
    .in("status", ["pending_claim", "claimed", "paid"])
    .gte("created_at", sastMonthStartIso());
  if (error) throw new Error(`cappedUsers: ${error.message}`);
  const counts = new Map<string, number>();
  for (const { user_id } of data ?? []) {
    counts.set(user_id, (counts.get(user_id) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()]
      .filter(([, n]) => n >= MONTHLY_WIN_CAP)
      .map(([u]) => u),
  );
}

async function executeDraw(
  supabase: SupabaseClient,
  type: "daily" | "weekly_streak",
  drawDate: string,
  entrants: Entrant[],
  winnersRequested: number,
): Promise<DrawOutcome> {
  const seed = newSeed();
  const snapshot = sortEntrants(entrants);
  const winners = selectWinners(snapshot, seed, winnersRequested);

  const { data: draw, error } = await supabase
    .from("draws")
    .insert({
      draw_date: drawDate,
      type,
      seed,
      algorithm: DRAW_ALGORITHM,
      entrants: snapshot,
      entrant_count: snapshot.length,
      winners_requested: winnersRequested,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { ran: false, reason: "already_ran" };
    }
    throw new Error(`draw insert (${type}): ${error.message}`);
  }

  if (winners.length > 0) {
    const expiresAt = new Date(
      Date.now() + CLAIM_WINDOW_HOURS * 3600 * 1000,
    ).toISOString();
    const { error: prizeErr } = await supabase.from("prizes").insert(
      winners.map((user_id) => ({
        draw_id: draw.id,
        user_id,
        amount_cents: PRIZE_CENTS,
        status: "pending_claim",
        expires_at: expiresAt,
      })),
    );
    if (prizeErr) throw new Error(`prize insert: ${prizeErr.message}`);
  }

  await audit(supabase, `${type}_draw`, {
    draw_id: draw.id,
    draw_date: drawDate,
    seed,
    entrant_count: snapshot.length,
    winners_requested: winnersRequested,
    winners,
  });
  return {
    ran: true,
    drawId: draw.id,
    entrantCount: snapshot.length,
    winners,
  };
}

/**
 * Daily draw over today's solvers: one entry per solved (unflagged) track,
 * winners are distinct users, win-capped and banned users excluded. Winner
 * target = 2 + prizes expired in today's sweep (roll-over).
 */
export async function runDailyDraw(
  supabase: SupabaseClient,
  rolledOver: number,
  drawDate: string = sastToday(),
): Promise<DrawOutcome> {
  const { data: plays, error } = await supabase
    .from("plays")
    .select(
      "user_id, puzzles!inner(track_code, puzzle_date), profiles!inner(banned)",
    )
    .eq("solved", true)
    .eq("flagged", false)
    .eq("puzzles.puzzle_date", drawDate)
    .eq("profiles.banned", false);
  if (error) throw new Error(`daily entrants: ${error.message}`);

  const capped = await cappedUsers(supabase);
  const entrants: Entrant[] = (plays ?? [])
    .filter((p) => !capped.has(p.user_id))
    .map((p) => {
      const puzzle = p.puzzles as unknown as { track_code: string };
      return {
        user_id: p.user_id,
        entry_key: `${p.user_id}:${puzzle.track_code}`,
      };
    });

  return executeDraw(
    supabase,
    "daily",
    drawDate,
    entrants,
    DAILY_BASE_WINNERS + rolledOver,
  );
}

/** Weekly draw over players holding a 7-day streak who solved today. */
export async function runWeeklyStreakDraw(
  supabase: SupabaseClient,
  drawDate: string = sastToday(),
): Promise<DrawOutcome> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("banned", false)
    .gte("current_streak", STREAK_THRESHOLD)
    .eq("last_solved_date", drawDate);
  if (error) throw new Error(`weekly entrants: ${error.message}`);

  const capped = await cappedUsers(supabase);
  const entrants: Entrant[] = (profiles ?? [])
    .filter((p) => !capped.has(p.id))
    .map((p) => ({ user_id: p.id, entry_key: p.id }));

  return executeDraw(supabase, "weekly_streak", drawDate, entrants, WEEKLY_WINNERS);
}
