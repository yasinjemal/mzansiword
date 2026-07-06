// The unified cross-mode streak — the retention spine (RFC-0001, docs §RETENTION).
//
// ONE streak per player, advanced by ANY qualifying daily action: solving the
// daily puzzle OR completing a new Journey level. Both game modes call the same
// atomic Postgres function `update_streak_on_solve(p_user, p_today, p_yesterday)`
// (migration 0001) so two concurrent actions can never double-increment.
//
// Streak shields (RFC-0002 B1, migration 0005) are a passive safety net for the
// fragile 0→7-day window: a short gap is auto-bridged by spending shields
// instead of resetting. Forgiving early, strict late — a gap larger than the
// shields held still resets. Shields are granted/earned only, never sold.
//
// This module is the PURE, TESTED SPECIFICATION of the transition rule. The SQL
// function is the atomic authority at write time; this mirrors it exactly for
// unit tests and for optimistic client-side streak display. If you change one,
// change the other — they must stay identical.
//
// Day boundaries are SAST calendar dates ('YYYY-MM-DD') from src/lib/time.ts;
// never compute them in UTC.

import { daysBetween } from "../time";

/** Max shields a player may hold. Kept scarce so they stay meaningful. */
export const SHIELD_CAP = 2;
/** Shields granted to every new player (grant-only; the migration backfills). */
export const SIGNUP_SHIELDS = 2;

export interface StreakState {
  /** Current consecutive-day streak. */
  current: number;
  /** All-time best streak (monotonic — never decreases). */
  best: number;
  /**
   * SAST date ('YYYY-MM-DD') of the last qualifying action, or null if the
   * player has never taken one. Column: profiles.last_solved_date. "solved" is
   * historical — it now means "last qualifying daily action", daily OR Journey.
   */
  last: string | null;
  /** Streak shields held, 0..SHIELD_CAP. Column: profiles.streak_shields. */
  shields: number;
}

export interface StreakTransition extends StreakState {
  /** True if this action moved the streak forward (first ever, or +1). */
  advanced: boolean;
  /** True if one or more shields were spent to bridge a gap this action. */
  shieldUsed: boolean;
}

/**
 * Compute the next streak state for a qualifying daily action taken "today".
 * Mirrors the `update_streak_on_solve` SQL function exactly:
 *   - already acted today         → no change (idempotent within a SAST day)
 *   - acted yesterday             → +1 (consecutive)
 *   - gap of `missed` days,
 *     with shields ≥ missed        → +1, spend `missed` shields (bridge the gap)
 *   - otherwise (first ever, or a
 *     gap larger than shields held) → reset to 1, shields untouched
 * `best` is max(best, newCurrent); `last` becomes today. Shields are consumed
 * only when they actually save the streak — never wasted on an unrecoverable gap.
 */
export function nextStreak(
  prev: StreakState,
  today: string,
  yesterday: string,
): StreakTransition {
  if (prev.last === today) {
    // Already counted today — a second action doesn't advance the streak.
    return {
      current: prev.current,
      best: prev.best,
      last: today,
      shields: prev.shields,
      advanced: false,
      shieldUsed: false,
    };
  }
  if (prev.last === yesterday) {
    const current = prev.current + 1;
    return {
      current,
      best: Math.max(prev.best, current),
      last: today,
      shields: prev.shields,
      advanced: true,
      shieldUsed: false,
    };
  }
  // A gap (or the first-ever action). Count the skipped days and bridge them
  // only if the player holds enough shields.
  const missed = prev.last === null ? Infinity : daysBetween(prev.last, today) - 1;
  if (missed >= 1 && missed <= prev.shields) {
    const current = prev.current + 1;
    return {
      current,
      best: Math.max(prev.best, current),
      last: today,
      shields: prev.shields - missed,
      advanced: true,
      shieldUsed: true,
    };
  }
  // First-ever action, or a gap larger than the shields held → reset. Shields
  // are kept (relief, never punished for an absence they couldn't cover).
  return {
    current: 1,
    best: Math.max(prev.best, 1),
    last: today,
    shields: prev.shields,
    advanced: true,
    shieldUsed: false,
  };
}

/**
 * Does a Journey completion qualify to advance the streak? Only genuine new
 * progress counts — replays and out-of-order URL jumps (which award 0 coins)
 * must not tick the streak, mirroring the coin-award rule in the completion
 * route. `awarded` is the coin award returned by that route.
 */
export function journeyActionQualifies(awarded: number): boolean {
  return awarded > 0;
}
