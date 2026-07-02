import { describe, expect, it } from "vitest";
import { isSolved, score, type Mark } from "./score";

const G = 2; // green
const Y = 1; // yellow
const _ = 0; // grey

describe("score", () => {
  it("marks an exact solve all green", () => {
    expect(score("molo", "molo")).toEqual([G, G, G, G]);
    expect(isSolved(score("molo", "molo") as Mark[])).toBe(true);
  });

  it("marks absent letters grey", () => {
    expect(score("braai", "stump")).toEqual([_, _, _, _, _]);
  });

  it("marks right-letter-wrong-spot yellow", () => {
    expect(score("hamba", "bhala")).toEqual([Y, Y, _, Y, G]);
  });

  it("does not double-count a letter the answer has once (duplicate in guess)", () => {
    // answer has one 'o'; guess 'oolo' -> first 'o' yellow? no:
    // positions: o-o-l-o vs m-o-l-o -> pos1 green, pos2? answer m unmatched...
    // guess[0]=o answer[0]=m; guess[1]=o answer[1]=o GREEN; guess[2]=l GREEN; guess[3]=o GREEN
    // unmatched answer letters: {m:1} -> guess[0] 'o' gets grey.
    expect(score("oolo", "molo")).toEqual([_, G, G, G]);
  });

  it("gives yellow only as many times as the letter appears unmatched", () => {
    // answer 'abbey': guess 'babes'
    // greens: pos2 b, pos3 e. unmatched answer letters: a, b, y
    // b(0): yellow (one b unmatched), a(1): yellow, s(4): grey
    expect(score("babes", "abbey")).toEqual([Y, Y, G, G, _]);
  });

  it("prefers green over yellow for duplicates", () => {
    // answer 'sassy', guess 'grass': s at pos3,4 of guess vs a-s-s of answer tail
    // g r a s s / s a s s y -> pos2 a? answer[2]=s no; pos3 s green; pos4 s vs y grey?
    // unmatched answer: s(0), a(1), y(4) -> {s:1,a:1,y:1}
    // g grey, r grey, a yellow, s GREEN, s yellow (one unmatched s)
    expect(score("grass", "sassy")).toEqual([_, _, Y, G, Y]);
  });

  it("handles 6-letter words (Nguni length)", () => {
    expect(score("enkosi", "enkosi")).toEqual([G, G, G, G, G, G]);
    // answer 'indoda', guess 'indada': i n d GREEN GREEN GREEN, a? answer[3]=o grey...
    // i-n-d-a-d-a vs i-n-d-o-d-a: pos0,1,2 green, pos3 a vs o, pos4 d green, pos5 a green
    // unmatched: {o:1} -> pos3 'a' grey
    expect(score("indada", "indoda")).toEqual([G, G, G, _, G, G]);
  });

  it("throws on length mismatch", () => {
    expect(() => score("mol", "molo")).toThrow();
  });
});
