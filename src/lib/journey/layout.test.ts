import { describe, expect, it } from "vitest";
import { layoutGrid, wordCells } from "./layout";
import { validateLevel } from "./validate";
import type { JourneyLevel } from "./types";

function asLevel(words: string[], maxSize = 9): JourneyLevel {
  const layout = layoutGrid(words, maxSize);
  return {
    id: "t-1-1",
    wheel: "abcdefghijklmnopqrstuvwxyz".split(""), // permissive for tests
    words: layout.placed,
    gridW: layout.gridW,
    gridH: layout.gridH,
    bonus: [],
  };
}

describe("layoutGrid", () => {
  it("places the first word horizontally at origin", () => {
    const { placed } = layoutGrid(["stone"], 9);
    expect(placed).toEqual([{ word: "stone", x: 0, y: 0, dir: "h" }]);
  });

  it("crosses words on shared letters, alternating orientation", () => {
    const { placed, skipped } = layoutGrid(["stone", "notes", "tone"], 9);
    expect(skipped).toEqual([]);
    expect(placed).toHaveLength(3);
    // structural sanity is fully checked by the validator
    const level = asLevel(["stone", "notes", "tone"]);
    // wheel is fake; only structural errors matter here
    expect(
      validateLevel(level).filter((e) => !e.includes("formable")),
    ).toEqual([]);
  });

  it("skips words with no legal placement instead of failing", () => {
    const { placed, skipped } = layoutGrid(["dog", "cat"], 9);
    expect(placed.map((p) => p.word)).toEqual(["dog"]);
    expect(skipped).toEqual(["cat"]); // no shared letters
  });

  it("never overlays words running the same direction", () => {
    const words = ["trade", "tread", "rated", "dart", "rate"];
    const level = asLevel(words);
    const structural = validateLevel(level).filter(
      (e) => !e.includes("formable"),
    );
    expect(structural).toEqual([]);
  });

  it("respects the bounding box cap", () => {
    const { gridW, gridH } = layoutGrid(
      ["planet", "plane", "eaten", "ental", "lean", "neat"],
      9,
    );
    expect(gridW).toBeLessThanOrEqual(9);
    expect(gridH).toBeLessThanOrEqual(9);
  });

  it("normalizes coordinates to a (0,0) origin", () => {
    const { placed } = layoutGrid(["stone", "notes"], 9);
    const xs = placed.flatMap((p) => wordCells(p).map((k) => Number(k.split(",")[0])));
    const ys = placed.flatMap((p) => wordCells(p).map((k) => Number(k.split(",")[1])));
    expect(Math.min(...xs)).toBe(0);
    expect(Math.min(...ys)).toBe(0);
  });
});
