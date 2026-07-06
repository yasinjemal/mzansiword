// Perfect Week — a repeating, no-reward gold pride state (RFC-0003).
//
// Fires when the unified streak (RFC-0001) reaches a positive multiple of a week
// PAST the first week: 14, 21, 28, … Day 7 is deliberately excluded — it is owned
// by the one-time `streak-7` Signature Moment (src/lib/signature/catalog.ts).
// Perfect Week is the *recurring* beat that fills the long gap between milestones.
//
// v1 is client-authoritative and carries no economy value (Bible §13), so it can
// read the `streak` the guess/journey routes already return — no backend, no
// migration. A future v2 shield reward (RFC-0002) would have to move server-side.

export const WEEK_LEN = 7;

/**
 * Does this streak value complete a Perfect Week? True on 14, 21, 28, … — every
 * whole week beyond the first. (Day 7 is the `streak-7` milestone's, not ours.)
 */
export function isPerfectWeek(streak: number): boolean {
  return streak > WEEK_LEN && streak % WEEK_LEN === 0;
}

/** Whole weeks represented by a streak (for copy: "3 weeks straight"). */
export function weeksInStreak(streak: number): number {
  return Math.floor(streak / WEEK_LEN);
}

const CLAIM_KEY = "mw:perfectweek:v1";

/**
 * One-shot claim guard: returns true at most once per streak value, so the same
 * Perfect Week never re-fires within a day or across a same-day cross-mode action
 * (a daily solve then a Journey level both return the same streak). Records the
 * claimed value in localStorage. Not pure — client-only; a no-op on the server.
 */
export function claimPerfectWeek(streak: number): boolean {
  if (!isPerfectWeek(streak)) return false;
  if (typeof window === "undefined") return false;
  try {
    const last = Number(window.localStorage.getItem(CLAIM_KEY) ?? "0");
    if (last === streak) return false;
    window.localStorage.setItem(CLAIM_KEY, String(streak));
    return true;
  } catch {
    // Storage blocked (private mode / quota) — celebrate once, best-effort.
    return true;
  }
}
