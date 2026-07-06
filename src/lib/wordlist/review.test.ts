import { describe, expect, it } from "vitest";
import { parseReviewCsv, planReview, type Decision } from "./review";

describe("parseReviewCsv", () => {
  it("parses keep/drop/fix rows and skips comments + blanks", () => {
    const csv = [
      "# reviewed by N. Speaker",
      "hamba,keep",
      "",
      "indlu,drop",
      "funda,fix,fundo",
    ].join("\n");
    const { decisions, errors } = parseReviewCsv(csv);
    expect(errors).toEqual([]);
    expect(decisions).toEqual<Decision[]>([
      { word: "hamba", action: "keep" },
      { word: "indlu", action: "drop" },
      { word: "funda", action: "fix", correction: "fundo" },
    ]);
  });

  it("lowercases and trims, and reports an unknown decision with its line", () => {
    const { decisions, errors } = parseReviewCsv("  UMZI , KEEP \nbeta,maybe");
    expect(decisions).toEqual([{ word: "umzi", action: "keep" }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("line 2");
    expect(errors[0]).toContain("maybe");
  });
});

describe("planReview", () => {
  it("routes keep→approve, drop→reject, fix→reject original + insert correction", () => {
    const plan = planReview([
      { word: "hamba", action: "keep" },
      { word: "indlu", action: "drop" },
      { word: "funda", action: "fix", correction: "fundo" },
    ]);
    expect(plan.approve).toEqual(["hamba"]);
    expect(plan.reject).toEqual(["funda", "indlu"]);
    expect(plan.insert).toEqual(["fundo"]);
    expect(plan.errors).toEqual([]);
  });

  it("treats a no-op fix (correction == word) as a keep, not a reject", () => {
    const plan = planReview([{ word: "hamba", action: "fix", correction: "hamba" }]);
    expect(plan.approve).toEqual(["hamba"]);
    expect(plan.reject).toEqual([]);
    expect(plan.insert).toEqual([]);
  });

  it("flags invalid words and corrections", () => {
    const plan = planReview([
      { word: "ab", action: "keep" }, // too short
      { word: "hamba", action: "fix", correction: "toolongword" },
    ]);
    expect(plan.approve).toEqual([]);
    expect(plan.errors).toHaveLength(2);
    expect(plan.errors[0]).toContain("ab");
    expect(plan.errors[1]).toContain("toolongword");
  });

  it("catches a keep/drop contradiction for the same word", () => {
    const plan = planReview([
      { word: "hamba", action: "keep" },
      { word: "hamba", action: "drop" },
    ]);
    expect(plan.errors.some((e) => e.includes("both approved and rejected"))).toBe(
      true,
    );
  });

  it("is order-independent and returns sorted, deduped lists", () => {
    const plan = planReview([
      { word: "vhusa", action: "keep" },
      { word: "abcde", action: "keep" },
      { word: "abcde", action: "keep" },
    ]);
    expect(plan.approve).toEqual(["abcde", "vhusa"]);
  });
});
