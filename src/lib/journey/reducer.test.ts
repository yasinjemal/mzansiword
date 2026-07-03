import { describe, expect, it } from "vitest";
import {
  initJourneyState,
  journeyReducer,
  type JourneyAction,
  type JourneyState,
} from "./reducer";
import {
  BONUS_WORD_REWARD,
  CHAPTER_REWARD,
  LEVEL_REWARD,
} from "./economy";
import type { JourneyLevel } from "./types";

// Real generated shape: THREE across, TREE + THERE down, THEE across.
const LEVEL: JourneyLevel = {
  id: "en-1-1",
  wheel: ["r", "h", "e", "e", "t"],
  words: [
    { word: "three", x: 2, y: 2, dir: "h" },
    { word: "tree", x: 2, y: 2, dir: "v" },
    { word: "there", x: 5, y: 0, dir: "v" },
    { word: "thee", x: 0, y: 4, dir: "h" },
  ],
  gridW: 7,
  gridH: 6,
  bonus: ["here"],
};

function run(state: JourneyState, ...actions: JourneyAction[]): JourneyState {
  return actions.reduce(journeyReducer, state);
}

/** Trace a word using the first available wheel instance of each letter. */
function trace(state: JourneyState, word: string): JourneyState {
  const used: number[] = [];
  for (const letter of word) {
    const idx = state.level.wheel.findIndex(
      (l, i) => l === letter && !used.includes(i),
    );
    used.push(idx);
  }
  let s = journeyReducer(state, { type: "trace_start", index: used[0] });
  for (const i of used.slice(1)) {
    s = journeyReducer(s, { type: "trace_enter", index: i });
  }
  return journeyReducer(s, { type: "trace_end" });
}

describe("journeyReducer", () => {
  const init = () => initJourneyState(LEVEL, false);

  it("fills a traced grid word", () => {
    const s = trace(init(), "tree");
    expect(s.foundWords).toEqual(["tree"]);
    expect(s.feedback?.kind).toBe("grid");
    expect(s.selection).toEqual([]);
  });

  it("pays coins for bonus words, once", () => {
    let s = trace(init(), "here");
    expect(s.foundBonus).toEqual(["here"]);
    expect(s.coinsEarned).toBe(BONUS_WORD_REWARD);
    s = trace(s, "here");
    expect(s.feedback?.kind).toBe("dupe");
    expect(s.coinsEarned).toBe(BONUS_WORD_REWARD);
  });

  it("rejects non-words and short traces", () => {
    const bad = trace(init(), "rete"); // formable but not a word here
    expect(bad.feedback?.kind).toBe("invalid");
    const short = trace(init(), "the");
    expect(short.feedback?.kind).toBe("too_short");
    expect(short.foundWords).toEqual([]);
  });

  it("backtracks when sliding onto the previous letter", () => {
    let s = journeyReducer(init(), { type: "trace_start", index: 4 }); // t
    s = journeyReducer(s, { type: "trace_enter", index: 0 }); // r
    s = journeyReducer(s, { type: "trace_enter", index: 4 }); // back onto t
    expect(s.selection).toEqual([4]);
  });

  it("supports keyboard entry with duplicate letters", () => {
    let s = init();
    for (const l of "three") s = journeyReducer(s, { type: "key_letter", letter: l });
    expect(s.selection).toHaveLength(5); // both e instances used
    s = journeyReducer(s, { type: "key_submit" });
    expect(s.foundWords).toContain("three");
  });

  it("completes the level and pays the level reward", () => {
    let s = init();
    for (const w of ["three", "tree", "there", "thee"]) s = trace(s, w);
    expect(s.status).toBe("level_done");
    expect(s.coinsEarned).toBe(LEVEL_REWARD);
  });

  it("pays the chapter bonus on the last level of a chapter", () => {
    let s = initJourneyState(LEVEL, true);
    for (const w of ["three", "tree", "there", "thee"]) s = trace(s, w);
    expect(s.status).toBe("chapter_done");
    expect(s.coinsEarned).toBe(LEVEL_REWARD + CHAPTER_REWARD);
  });

  it("hint reveals cascade into auto-completion", () => {
    let s = init();
    for (const w of ["three", "there", "thee"]) s = trace(s, w);
    // 'tree' = t(2,2) r(2,3) e(2,4) e(2,5); crossings fill t; reveal the rest
    s = run(
      s,
      { type: "hint", cell: "2,3" },
      { type: "hint", cell: "2,4" },
      { type: "hint", cell: "2,5" },
    );
    expect(s.foundWords).toContain("tree");
    expect(s.status).toBe("level_done");
    expect(s.hintsUsed).toBe(3);
  });

  it("ignores input after completion", () => {
    let s = init();
    for (const w of ["three", "tree", "there", "thee"]) s = trace(s, w);
    const after = trace(s, "here");
    expect(after.foundBonus).toEqual([]);
    expect(after.status).toBe("level_done");
  });
});
