import { describe, expect, it } from "vitest";
import {
  blocklistCoverage,
  isBlocklisted,
  isOffensive,
  offensiveSet,
  screenWords,
} from "./safety";

describe("offensive screen", () => {
  it("flags a seeded offensive word, case-insensitively", () => {
    expect(isOffensive("shit")).toBe(true);
    expect(isOffensive("SHIT")).toBe(true);
    expect(isOffensive(" Shit ")).toBe(true);
  });

  it("passes clean, innocent words", () => {
    for (const w of ["hamba", "table", "stone", "funda", "class", "grass"]) {
      expect(isOffensive(w)).toBe(false);
    }
  });

  it("matches whole words only — never substrings (Scunthorpe)", () => {
    // "trash" contains "ash"; exact-membership must NOT flag it.
    const set = new Set(["ash"]);
    expect(isBlocklisted("trash", set)).toBe(false);
    expect(isBlocklisted("ash", set)).toBe(true);
  });

  it("screens against language-agnostic terms even for another track", () => {
    // An English slur must flag on an isiXhosa track too (cross-language safety).
    expect(isOffensive("cunt", "xh")).toBe(true);
    expect(screenWords(["hamba", "cunt", "indlu"], "xh")).toEqual(["cunt"]);
  });

  it("dedupes and normalizes screenWords output", () => {
    expect(screenWords(["Shit", "shit", "clean"])).toEqual(["shit"]);
  });

  it("offensiveSet(track) is all ∪ track; no-arg is the union of every scope", () => {
    const xh = offensiveSet("xh");
    expect(xh.has("shit")).toBe(true); // from `all`
    expect(offensiveSet().size).toBeGreaterThanOrEqual(xh.size);
  });

  it("reports coverage so unscreened languages are visible, not assumed safe", () => {
    const cov = blocklistCoverage();
    expect(cov.all).toBeGreaterThan(0);
    // The honest part: isiXhosa is not yet screened — the number proves it.
    expect(cov.xh).toBe(0);
  });
});
