import { describe, it, expect } from "vitest";
import { challengeOutcome } from "./outcome";

const chal = (guesses: number) => ({ name: "Sipho", puzzle: 42, guesses });

describe("challengeOutcome", () => {
  it("fewer guesses wins", () => {
    expect(challengeOutcome({ solved: true, guesses: 2 }, chal(3))).toBe("win");
    expect(challengeOutcome({ solved: true, guesses: 4 }, chal(3))).toBe("loss");
  });

  it("equal guess counts draw", () => {
    expect(challengeOutcome({ solved: true, guesses: 3 }, chal(3))).toBe("draw");
  });

  it("a solve beats a fail regardless of count", () => {
    expect(challengeOutcome({ solved: true, guesses: 6 }, chal(0))).toBe("win");
    expect(challengeOutcome({ solved: false, guesses: 6 }, chal(4))).toBe("loss");
  });

  it("two fails draw", () => {
    expect(challengeOutcome({ solved: false, guesses: 6 }, chal(0))).toBe("draw");
  });
});
