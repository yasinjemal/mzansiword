import { describe, it, expect } from "vitest";
import { nextStreak, journeyActionQualifies } from "./streak";

// The pure streak spec must match update_streak_on_solve (migration 0001)
// exactly. These cases pin the semantics for BOTH game modes (RFC-0001).

describe("nextStreak", () => {
  const today = "2026-07-06";
  const yesterday = "2026-07-05";

  it("first ever action starts the streak at 1", () => {
    const r = nextStreak({ current: 0, best: 0, last: null }, today, yesterday);
    expect(r).toEqual({ current: 1, best: 1, last: today, advanced: true });
  });

  it("acting on a consecutive day increments", () => {
    const r = nextStreak({ current: 6, best: 6, last: yesterday }, today, yesterday);
    expect(r.current).toBe(7);
    expect(r.best).toBe(7);
    expect(r.advanced).toBe(true);
  });

  it("a second action the same day does not advance (idempotent)", () => {
    const r = nextStreak({ current: 7, best: 9, last: today }, today, yesterday);
    expect(r.current).toBe(7);
    expect(r.best).toBe(9); // best preserved, not lowered
    expect(r.advanced).toBe(false);
  });

  it("a gap resets the streak to 1", () => {
    const r = nextStreak(
      { current: 40, best: 40, last: "2026-07-01" },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.advanced).toBe(true);
  });

  it("best_streak is monotonic across a reset", () => {
    const r = nextStreak(
      { current: 40, best: 40, last: "2026-06-20" },
      today,
      yesterday,
    );
    expect(r.current).toBe(1);
    expect(r.best).toBe(40); // never decreases
  });

  it("cross-mode: daily then Journey same day keeps one streak (no double count)", () => {
    // Daily solve advances first...
    const afterDaily = nextStreak(
      { current: 2, best: 2, last: yesterday },
      today,
      yesterday,
    );
    expect(afterDaily.current).toBe(3);
    // ...then a Journey level the same day must NOT advance again.
    const afterJourney = nextStreak(afterDaily, today, yesterday);
    expect(afterJourney.current).toBe(3);
    expect(afterJourney.advanced).toBe(false);
  });
});

describe("journeyActionQualifies", () => {
  it("counts only genuine new progress (awarded > 0)", () => {
    expect(journeyActionQualifies(15)).toBe(true);
    expect(journeyActionQualifies(0)).toBe(false); // replay / out-of-order jump
  });
});
