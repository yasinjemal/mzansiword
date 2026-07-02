import { describe, expect, it } from "vitest";
import { selectWinners, sortEntrants, type Entrant } from "./select";

const SEED = "cd".repeat(32);

function entrants(): Entrant[] {
  return [
    { user_id: "u1", entry_key: "u1:xh" },
    { user_id: "u1", entry_key: "u1:en" }, // bilingual solver: two tickets
    { user_id: "u2", entry_key: "u2:xh" },
    { user_id: "u3", entry_key: "u3:en" },
    { user_id: "u4", entry_key: "u4:xh" },
  ];
}

describe("selectWinners", () => {
  it("is deterministic for the same seed and snapshot", () => {
    expect(selectWinners(entrants(), SEED, 2)).toEqual(
      selectWinners(entrants(), SEED, 2),
    );
  });

  it("is order-insensitive on input (canonical sort)", () => {
    const reversed = entrants().reverse();
    expect(selectWinners(reversed, SEED, 2)).toEqual(
      selectWinners(entrants(), SEED, 2),
    );
  });

  it("never picks the same user twice", () => {
    const winners = selectWinners(entrants(), SEED, 4);
    expect(new Set(winners).size).toBe(winners.length);
  });

  it("stops when entrants run out", () => {
    expect(selectWinners(entrants(), SEED, 10)).toHaveLength(4);
    expect(selectWinners([], SEED, 2)).toEqual([]);
  });

  it("changes with the seed", () => {
    const many: Entrant[] = Array.from({ length: 50 }, (_, i) => ({
      user_id: `u${i}`,
      entry_key: `u${i}:xh`,
    }));
    const a = selectWinners(many, SEED, 5);
    const b = selectWinners(many, "ef".repeat(32), 5);
    expect(a).not.toEqual(b);
  });
});

describe("sortEntrants", () => {
  it("does not mutate and sorts by entry_key", () => {
    const input = entrants();
    const copy = [...input];
    const sorted = sortEntrants(input);
    expect(input).toEqual(copy);
    expect(sorted.map((e) => e.entry_key)).toEqual(
      [...copy.map((e) => e.entry_key)].sort((a, b) => a.localeCompare(b)),
    );
  });
});
