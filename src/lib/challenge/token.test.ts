import { describe, it, expect } from "vitest";
import {
  encodeChallenge,
  decodeChallenge,
  sanitizeName,
  NAME_MAX,
  type Challenge,
} from "./token";

describe("challenge token round-trip", () => {
  it("encodes and decodes a solve challenge", () => {
    const c: Challenge = { name: "Sipho", puzzle: 42, guesses: 3 };
    expect(decodeChallenge(encodeChallenge(c))).toEqual(c);
  });

  it("preserves a fail (guesses 0 = X/6)", () => {
    const c: Challenge = { name: "Thandi", puzzle: 7, guesses: 0 };
    expect(decodeChallenge(encodeChallenge(c))).toEqual(c);
  });

  it("keeps multi-byte names intact", () => {
    const token = encodeChallenge({ name: "Zoë", puzzle: 5, guesses: 4 });
    expect(decodeChallenge(token)?.name).toBe("Zoë");
  });

  it("clamps guesses into 0..MAX_GUESSES", () => {
    expect(
      decodeChallenge(encodeChallenge({ name: "A", puzzle: 1, guesses: 99 }))?.guesses,
    ).toBe(6);
    expect(
      decodeChallenge(encodeChallenge({ name: "A", puzzle: 1, guesses: -3 }))?.guesses,
    ).toBe(0);
  });
});

describe("decode rejects bad input", () => {
  it("returns null for junk / empty / wrong version / bad puzzle", () => {
    expect(decodeChallenge(null)).toBeNull();
    expect(decodeChallenge("")).toBeNull();
    expect(decodeChallenge("not-base64!!")).toBeNull();
    expect(decodeChallenge(btoa(JSON.stringify({ v: 2, n: "x", p: 1, g: 1 })))).toBeNull();
    expect(decodeChallenge(btoa(JSON.stringify({ v: 1, p: 0, g: 1 })))).toBeNull();
  });
});

describe("spoiler-safety invariant (RFC-0004)", () => {
  it("a decoded challenge exposes ONLY name/puzzle/guesses", () => {
    const c = decodeChallenge(encodeChallenge({ name: "Sipho", puzzle: 42, guesses: 3 }));
    expect(c).not.toBeNull();
    expect(Object.keys(c!).sort()).toEqual(["guesses", "name", "puzzle"]);
  });

  it("ignores any smuggled extra fields (e.g. the answer)", () => {
    const malicious = btoa(
      JSON.stringify({ v: 1, n: "Sipho", p: 42, g: 3, w: "abaci", answer: "abaci" }),
    );
    const c = decodeChallenge(malicious);
    expect(c).toEqual({ name: "Sipho", puzzle: 42, guesses: 3 });
    expect(JSON.stringify(c)).not.toContain("abaci");
  });
});

describe("sanitizeName", () => {
  it("removes every URL / markup / control character", () => {
    // Disallowed punctuation is dropped; the invariant is that no <>/:?=&. or
    // control chars survive (remaining letters are harmless — React escapes them).
    for (const raw of ["Sipho<script>", "http://evil.co?x=1", "a&b=c"]) {
      expect(sanitizeName(raw)).not.toMatch(/[<>:/?=&.]/);
    }
  });

  it("keeps allowed characters: letters and internal spaces", () => {
    expect(sanitizeName("Sipho")).toBe("Sipho");
    expect(sanitizeName("a b")).toBe("a b"); // space is allowed
  });

  it("keeps SA names with diacritics, hyphens, apostrophes", () => {
    expect(sanitizeName("Anele-Zoë")).toBe("Anele-Zoë");
    expect(sanitizeName("N'anda")).toBe("N'anda");
  });

  it("strips digits, collapses whitespace, caps length", () => {
    expect(sanitizeName("  Sipho   M100  ")).toBe("Sipho M"); // digits gone, spaces collapsed
    expect(sanitizeName("Abcdefghijklmnopqrst").length).toBe(NAME_MAX);
  });
});
