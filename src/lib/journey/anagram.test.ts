import { describe, expect, it } from "vitest";
import { canForm, formable, letterCounts } from "./anagram";

describe("canForm", () => {
  const base = letterCounts("garden");

  it("accepts words within the letter multiset", () => {
    expect(canForm("garden", base)).toBe(true);
    expect(canForm("range", base)).toBe(true);
    expect(canForm("dare", base)).toBe(true);
  });

  it("rejects words needing absent or extra letters", () => {
    expect(canForm("grade", base)).toBe(true);
    expect(canForm("guard", base)).toBe(false); // no u
    expect(canForm("added", base)).toBe(false); // needs two d's
  });

  it("respects duplicate counts", () => {
    const b = letterCounts("banana");
    expect(canForm("banana", b)).toBe(true);
    expect(canForm("nanna", b)).toBe(false); // needs three n's
  });
});

describe("formable", () => {
  it("returns all subanagrams incl. the base", () => {
    const dict = ["garden", "range", "anger", "dare", "read", "gnome", "dared"];
    expect(formable("garden", dict)).toEqual([
      "garden",
      "range",
      "anger",
      "dare",
      "read",
    ]);
  });
});
