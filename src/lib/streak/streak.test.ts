import { describe, it, expect } from "vitest";
import { nextStreak, journeyActionQualifies, SHIELD_CAP } from "./streak";

// The pure streak spec must match update_streak_on_solve (migrations 0001 +
// 0005) exactly. These cases pin the semantics for BOTH game modes (RFC-0001)
// and the shield safety net (RFC-0002 B1).

describe("nextStreak", () => {
  const today = "2026-07-06";
  const yesterday = "2026-07-05";

  it("first ever action starts the streak at 1 (no shield spent)", () => {
    const r = nextStreak(
      { current: 0, best: 0, last: null, shields: SHIELD_CAP },
      today,
      yesterday,
    );
    expect(r).toEqual({
      current: 1,
      best: 1,
      last: today,
      shields: SHIELD_CAP,
      advanced: true,
      shieldUsed: false,
    });
  });

  it("acting on a consecutive day increments (no shield spent)", () => {
    const r = nextStreak(
      { current: 6, best: 6, last: yesterday, shields: 2 },
      today,
      yesterday,
    );
    expect(r.current).toBe(7);
    expect(r.best).toBe(7);
    expect(r.advanced).toBe(true);
    expect(r.shieldUsed).toBe(false);
    expect(r.shields).toBe(2);
  });

  it("a second action the same day does not advance (idempotent)", () => {
    const r = nextStreak(
      { current: 7, best: 9, last: today, shields: 1 },
      today,
      yesterday,
    );
    expect(r.current).toBe(7);
    expect(r.best).toBe(9); // best preserved, not lowered
    expect(r.advanced).toBe(false);
    expect(r.shieldUsed).toBe(false);
    expect(r.shields).toBe(1); // untouched
  });

  it("best_streak is monotonic across a reset", () => {
    const r = nextStreak(
      { current: 40, best: 40, last: "2026-06-20", shields: 0 },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.best).toBe(40); // never decreases
  });

  it("cross-mode: daily then Journey same day keeps one streak (no double count)", () => {
    // Daily solve advances first...
    const afterDaily = nextStreak(
      { current: 2, best: 2, last: yesterday, shields: 2 },
      today,
      yesterday,
    );
    expect(afterDaily.current).toBe(3);
    // ...then a Journey level the same day must NOT advance again.
    const afterJourney = nextStreak(afterDaily, today, yesterday);
    expect(afterJourney.current).toBe(3);
    expect(afterJourney.advanced).toBe(false);
    expect(afterJourney.shieldUsed).toBe(false);
  });

  // --- shields (RFC-0002 B1) --------------------------------------------

  it("a one-day gap spends one shield and continues the streak", () => {
    // last acted the day before yesterday → exactly one missed day.
    const r = nextStreak(
      { current: 4, best: 4, last: "2026-07-04", shields: 2 },
      today,
      yesterday,
    );
    expect(r.current).toBe(5); // continued, not reset
    expect(r.best).toBe(5);
    expect(r.shields).toBe(1); // one shield spent
    expect(r.shieldUsed).toBe(true);
    expect(r.advanced).toBe(true);
  });

  it("two shields bridge a two-day gap", () => {
    // last acted three days ago → two missed days, two shields cover it.
    const r = nextStreak(
      { current: 4, best: 4, last: "2026-07-03", shields: 2 },
      today,
      yesterday,
    );
    expect(r.current).toBe(5);
    expect(r.shields).toBe(0); // both spent
    expect(r.shieldUsed).toBe(true);
  });

  it("a gap larger than the shields held resets, keeping the shields", () => {
    // three missed days but only two shields → strict late, reset.
    const r = nextStreak(
      { current: 12, best: 12, last: "2026-07-02", shields: 2 },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.shields).toBe(2); // not wasted on an unrecoverable gap
    expect(r.shieldUsed).toBe(false);
    expect(r.best).toBe(12);
  });

  it("a one-day gap with zero shields resets", () => {
    const r = nextStreak(
      { current: 4, best: 4, last: "2026-07-04", shields: 0 },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.shields).toBe(0);
    expect(r.shieldUsed).toBe(false);
  });

  it("one shield only covers a one-day gap, not a two-day gap", () => {
    // two missed days, one shield → not enough, reset.
    const r = nextStreak(
      { current: 8, best: 8, last: "2026-07-03", shields: 1 },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.shields).toBe(1); // kept
    expect(r.shieldUsed).toBe(false);
  });
});

describe("journeyActionQualifies", () => {
  it("counts only genuine new progress (awarded > 0)", () => {
    expect(journeyActionQualifies(15)).toBe(true);
    expect(journeyActionQualifies(0)).toBe(false); // replay / out-of-order jump
  });
});
