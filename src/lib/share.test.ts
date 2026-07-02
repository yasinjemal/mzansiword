import { describe, expect, it } from "vitest";
import { buildShareText, whatsappShareUrl } from "./share";
import type { GuessEntry } from "./game/types";

const guesses: GuessEntry[] = [
  { word: "molo", marks: [2, 0, 1, 0] },
  { word: "milo", marks: [2, 2, 2, 2] },
];

describe("buildShareText", () => {
  it("builds a spoiler-free grid with score and streak", () => {
    const text = buildShareText({
      trackName: "isiXhosa",
      puzzleNumber: 47,
      guesses,
      solved: true,
      maxGuesses: 6,
      streak: 7,
      url: "https://mzansiword.co.za/p/xh",
    });
    expect(text).toContain("isiXhosa #47 2/6 🔥7");
    expect(text).toContain("🟩⬛🟨⬛");
    expect(text).toContain("🟩🟩🟩🟩");
    expect(text).toContain("https://mzansiword.co.za/p/xh");
    // spoiler-free: no guessed letters leak
    expect(text).not.toMatch(/\bmolo\b|\bmilo\b/);
  });

  it("shows X/6 and no streak on a loss", () => {
    const text = buildShareText({
      trackName: "English",
      puzzleNumber: 3,
      guesses,
      solved: false,
      maxGuesses: 6,
      streak: 5,
      url: "u",
    });
    expect(text).toContain("X/6");
    expect(text).not.toContain("🔥");
  });
});

describe("whatsappShareUrl", () => {
  it("URL-encodes the text", () => {
    expect(whatsappShareUrl("a b\nc")).toBe(
      "https://wa.me/?text=a%20b%0Ac",
    );
  });
});
