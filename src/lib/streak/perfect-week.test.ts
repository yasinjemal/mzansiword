import { describe, it, expect } from "vitest";
import { isPerfectWeek, weeksInStreak, WEEK_LEN } from "./perfect-week";

// Perfect Week (RFC-0003) fires on whole-week streak multiples PAST the first
// week. Day 7 belongs to the streak-7 Signature Moment, so it must NOT count.

describe("isPerfectWeek", () => {
  it("excludes the first week (day 7 is the streak-7 milestone's)", () => {
    expect(isPerfectWeek(7)).toBe(false);
  });

  it("fires on every whole week beyond the first", () => {
    expect(isPerfectWeek(14)).toBe(true);
    expect(isPerfectWeek(21)).toBe(true);
    expect(isPerfectWeek(28)).toBe(true);
    expect(isPerfectWeek(70)).toBe(true);
  });

  it("does not fire mid-week", () => {
    for (const s of [1, 6, 8, 13, 15, 20, 22]) {
      expect(isPerfectWeek(s)).toBe(false);
    }
  });

  it("does not fire on non-week milestones (30, 100, 365 aren't multiples of 7)", () => {
    expect(isPerfectWeek(30)).toBe(false);
    expect(isPerfectWeek(100)).toBe(false);
    expect(isPerfectWeek(365)).toBe(false);
  });

  it("ignores zero / negative", () => {
    expect(isPerfectWeek(0)).toBe(false);
    expect(isPerfectWeek(-7)).toBe(false);
  });
});

describe("weeksInStreak", () => {
  it("counts whole weeks", () => {
    expect(weeksInStreak(14)).toBe(2);
    expect(weeksInStreak(21)).toBe(3);
    expect(weeksInStreak(20)).toBe(2); // floored
    expect(WEEK_LEN).toBe(7);
  });
});
