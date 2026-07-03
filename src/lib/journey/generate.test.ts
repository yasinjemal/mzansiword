import { describe, expect, it } from "vitest";
import { generateTrack, CHAPTER_CONFIGS, LEVELS_PER_CHAPTER } from "./generate";
import { validateLevel } from "./validate";

// A small but crossing-rich English dictionary for fast tests.
const COMMON = [
  "stone", "notes", "tones", "onset", "steno", "tone", "note", "nest",
  "nets", "sent", "tens", "toes", "ones", "eons", "garden", "danger",
  "gander", "range", "anger", "grand", "grade", "raged", "dare", "dear",
  "read", "gear", "rage", "near", "earn", "dean", "rand", "darn",
  "planet", "eaten", "plane", "plant", "petal", "leapt", "plate", "pleat",
  "lane", "lean", "neat", "tale", "teal", "plan", "pant", "pane", "peat",
  "master", "stream", "tamers", "smart", "steam", "tames", "mates", "meats",
  "teams", "rates", "stare", "tears", "mare", "mars", "mast", "mate",
  "meat", "rats", "seam", "star", "tame", "team", "tear", "term",
];
const ALL = [...COMMON, "strem", "reams", "smear", "aster", "taser", "earns", "nares", "saner", "snare", "antes", "etnas"];

describe("generateTrack", () => {
  const out = generateTrack({
    track: "test",
    common: COMMON,
    all: ALL,
    seed: "unit-test",
  });

  it("produces chapters with valid levels", () => {
    expect(out.chapters.length).toBeGreaterThan(0);
    const dictSet = new Set(ALL.filter((w) => /^[a-z]{4,6}$/.test(w)));
    for (const chapter of out.chapters) {
      for (const level of chapter) {
        expect(validateLevel(level, dictSet)).toEqual([]);
      }
    }
  });

  it("respects chapter grid bounds", () => {
    out.chapters.forEach((chapter, c) => {
      const config = CHAPTER_CONFIGS[c];
      for (const level of chapter) {
        expect(level.words.length).toBeGreaterThanOrEqual(config.gridMin);
        expect(level.words.length).toBeLessThanOrEqual(config.gridMax);
        expect(level.wheel).toHaveLength(config.wheelSize);
        expect(chapter.length).toBeLessThanOrEqual(LEVELS_PER_CHAPTER);
      }
    });
  });

  it("never reuses a base word (wheel) across the track", () => {
    const wheels = out.chapters.flat().map((l) => [...l.wheel].sort().join(""));
    expect(new Set(wheels).size).toBe(wheels.length);
  });

  it("is deterministic for the same seed", () => {
    const again = generateTrack({
      track: "test",
      common: COMMON,
      all: ALL,
      seed: "unit-test",
    });
    expect(again.chapters).toEqual(out.chapters);
  });

  it("reports and degrades gracefully on a thin dictionary", () => {
    const thin = generateTrack({
      track: "thin",
      common: ["stone", "notes", "tone", "note"],
      all: ["stone", "notes", "tone", "note", "nest", "sent"],
      seed: "thin",
      relax: true,
    });
    // Must not throw; whatever it produced must be valid.
    for (const chapter of thin.chapters) {
      for (const level of chapter) {
        expect(validateLevel(level)).toEqual([]);
      }
    }
    expect(thin.report.length).toBeGreaterThan(0);
  });
});
