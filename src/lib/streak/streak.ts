// The unified cross-mode streak — the retention spine (RFC-0001, docs §RETENTION).
//
// ONE streak per player, advanced by ANY qualifying daily action: solving the
// daily puzzle OR completing a new Journey level. Both game modes call the same
// atomic Postgres function `update_streak_on_solve(p_user, p_today, p_yesterday)`
// (migration 0001) so two concurrent actions can never double-increment.
//
// This module is the PURE, TESTED SPECIFICATION of the transition rule. The SQL
// function is the atomic authority at write time; this mirrors it exactly for
// unit tests and for optimistic client-side streak display. If you change one,
// change the other — they must stay identical.
//
// Day boundaries are SAST calendar dates ('YYYY-MM-DD') from src/lib/time.ts;
// never compute them in UTC.

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
}

export interface StreakTransition extends StreakState {
  /** True if this action moved the streak forward (first ever, or +1). */
  advanced: boolean;
}

/**
 * Compute the next streak state for a qualifying daily action taken "today".
 * Mirrors the `update_streak_on_solve` SQL function exactly:
 *   - already acted today  → no change (idempotent within a SAST day)
 *   - acted yesterday      → +1
 *   - otherwise            → reset to 1 (first ever, or a gap)
 * `best` is max(best, newCurrent); `last` becomes today.
 */
export function nextStreak(
  prev: StreakState,
  today: string,
  yesterday: string,
): StreakTransition {
  if (prev.last === today) {
    // Already counted today — a second action doesn't advance the streak.
    return { current: prev.current, best: prev.best, last: today, advanced: false };
  }
  const current = prev.last === yesterday ? prev.current + 1 : 1;
  const best = Math.max(prev.best, current);
  return { current, best, last: today, advanced: true };
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
