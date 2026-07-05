import { describe, it, expect } from "vitest";
import { detectNewMoments } from "./detect";
import type { PlayerSnapshot } from "./types";

const base: PlayerSnapshot = {
  currentStreak: 0,
  bestStreak: 0,
  dailySolves: 0,
  lastGuessCount: null,
  wordsDiscovered: 0,
  journeyLevels: 0,
  chaptersDone: 0,
};

const ids = (snap: Partial<PlayerSnapshot>, awarded: string[] = []) =>
  detectNewMoments({ ...base, ...snap }, new Set(awarded)).map((m) => m.id);

describe("detectNewMoments", () => {
  it("fires the first-solve moment on the first daily solve", () => {
    expect(ids({ dailySolves: 1, lastGuessCount: 4 })).toContain("first-daily");
  });

  it("does not re-award a moment already earned", () => {
    expect(ids({ dailySolves: 1, lastGuessCount: 4 }, ["first-daily"])).not.toContain(
      "first-daily",
    );
  });

  it("awards clutch-two for a 2-guess solve but not hole-in-one", () => {
    const got = ids({ dailySolves: 3, lastGuessCount: 2 });
    expect(got).toContain("clutch-two");
    expect(got).not.toContain("hole-in-one");
  });

  it("awards both clutch-two and hole-in-one on a 1-guess solve", () => {
    const got = ids({ dailySolves: 3, lastGuessCount: 1 });
    expect(got).toContain("clutch-two");
    expect(got).toContain("hole-in-one");
  });

  it("does not fire guess-based moments when lastGuessCount is null", () => {
    const got = ids({ wordsDiscovered: 30 });
    expect(got).not.toContain("clutch-two");
    expect(got).not.toContain("hole-in-one");
  });

  it("fires streak tiers at their thresholds", () => {
    expect(ids({ currentStreak: 7 })).toContain("streak-7");
    expect(ids({ currentStreak: 30 })).toEqual(
      expect.arrayContaining(["streak-7", "streak-30"]),
    );
    expect(ids({ currentStreak: 100 })).toContain("streak-100");
  });

  it("does not fire a streak tier below its threshold", () => {
    expect(ids({ currentStreak: 6 })).not.toContain("streak-7");
  });

  it("orders a batch spark → gold → legend (climax last)", () => {
    // currentStreak 100 crosses streak-7 (spark), streak-30 (gold), streak-100 (legend)
    const ordered = detectNewMoments(
      { ...base, currentStreak: 100 },
      new Set<string>(),
    ).map((m) => m.tier);
    const rank = { spark: 0, gold: 1, legend: 2 } as const;
    for (let i = 1; i < ordered.length; i++) {
      expect(rank[ordered[i]]).toBeGreaterThanOrEqual(rank[ordered[i - 1]]);
    }
  });

  it("fires discovery + journey milestones from cumulative counters", () => {
    expect(ids({ wordsDiscovered: 1000 })).toContain("words-1000");
    expect(ids({ chaptersDone: 1 })).toContain("chapter-first");
    expect(ids({ journeyLevels: 50 })).toContain("journey-50");
  });

  it("never fires a 'planned' moment", () => {
    const got = ids({
      currentStreak: 999,
      wordsDiscovered: 99999,
      journeyLevels: 999,
      chaptersDone: 999,
      dailySolves: 999,
      lastGuessCount: 1,
    });
    expect(got).not.toContain("province-first-today");
    expect(got).not.toContain("school-number-one");
    expect(got).not.toContain("collection-animals");
    expect(got).not.toContain("grade-5-vocab");
  });
});
