import { describe, expect, it } from "vitest";
import { makeIntPicker, newSeed, seededShuffle } from "./rng";

const SEED = "ab".repeat(32);

describe("makeIntPicker", () => {
  it("is deterministic for the same seed and label", () => {
    const a = makeIntPicker(SEED, "draw");
    const b = makeIntPicker(SEED, "draw");
    for (let i = 0; i < 50; i++) expect(a(1000)).toBe(b(1000));
  });

  it("differs across labels", () => {
    const a = makeIntPicker(SEED, "one");
    const b = makeIntPicker(SEED, "two");
    const seqA = Array.from({ length: 20 }, () => a(10_000));
    const seqB = Array.from({ length: 20 }, () => b(10_000));
    expect(seqA).not.toEqual(seqB);
  });

  it("stays in range", () => {
    const pick = makeIntPicker(SEED, "range");
    for (let n = 1; n <= 20; n++) {
      const v = pick(n);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(n);
    }
  });

  it("rejects non-positive ranges", () => {
    const pick = makeIntPicker(SEED, "bad");
    expect(() => pick(0)).toThrow();
  });
});

describe("seededShuffle", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("is deterministic and a permutation", () => {
    const a = seededShuffle(items, SEED);
    const b = seededShuffle(items, SEED);
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(items);
    expect(a).not.toEqual(items); // vanishingly unlikely for 30 items
  });

  it("does not mutate the input", () => {
    const copy = items.slice();
    seededShuffle(items, SEED);
    expect(items).toEqual(copy);
  });
});

describe("newSeed", () => {
  it("returns 64 hex chars and is unique", () => {
    const s = newSeed();
    expect(s).toMatch(/^[0-9a-f]{64}$/);
    expect(newSeed()).not.toBe(s);
  });
});
