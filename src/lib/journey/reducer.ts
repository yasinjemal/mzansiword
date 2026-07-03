// Journey play-screen state machine. Pure and fully unit-testable: the
// components dispatch, this decides. Gameplay is deliberately
// client-authoritative — the level object carries its own answers and no
// prize hangs on it (see docs/journey.md); do not "fix" this by moving
// validation to the server.

import { wordCells } from "./layout";
import {
  BONUS_WORD_REWARD,
  CHAPTER_REWARD,
  LEVEL_REWARD,
} from "./economy";
import type { JourneyLevel } from "./types";

export const MIN_WORD_LEN = 4;

export type Feedback =
  | { kind: "grid"; word: string; n: number }
  | { kind: "bonus"; word: string; n: number }
  | { kind: "dupe"; word: string; n: number }
  | { kind: "invalid"; word: string; n: number }
  | { kind: "too_short"; word: string; n: number };

export interface JourneyState {
  level: JourneyLevel;
  isLastInChapter: boolean;
  foundWords: string[];
  foundBonus: string[];
  revealedCells: string[]; // "x,y" hint-revealed cells
  selection: number[]; // indices into level.wheel (a letter instance at most once)
  tracing: boolean;
  wheelOrder: number[]; // display position -> wheel index
  status: "playing" | "level_done" | "chapter_done";
  feedback: Feedback | null;
  coinsEarned: number; // this level: bonus + completion rewards
  hintsUsed: number;
  lastFound: string | null; // most recently filled grid word (animation)
}

export type JourneyAction =
  | { type: "trace_start"; index: number }
  | { type: "trace_enter"; index: number }
  | { type: "trace_end" }
  | { type: "trace_cancel" }
  | { type: "key_letter"; letter: string }
  | { type: "key_backspace" }
  | { type: "key_submit" }
  | { type: "key_clear" }
  | { type: "shuffle"; order: number[] }
  | { type: "hint"; cell: string }
  | { type: "clear_feedback" };

export function initJourneyState(
  level: JourneyLevel,
  isLastInChapter: boolean,
): JourneyState {
  return {
    level,
    isLastInChapter,
    foundWords: [],
    foundBonus: [],
    revealedCells: [],
    selection: [],
    tracing: false,
    wheelOrder: level.wheel.map((_, i) => i),
    status: "playing",
    feedback: null,
    coinsEarned: 0,
    hintsUsed: 0,
    lastFound: null,
  };
}

/** Cells currently showing a letter: found words' cells + hint reveals. */
export function filledCells(state: JourneyState): Set<string> {
  const filled = new Set(state.revealedCells);
  for (const p of state.level.words) {
    if (state.foundWords.includes(p.word)) {
      for (const c of wordCells(p)) filled.add(c);
    }
  }
  return filled;
}

/**
 * Auto-complete cascade: a word whose every cell is visible (via crossings
 * and hints) counts as found. Runs to a fixpoint.
 */
function cascade(
  level: JourneyLevel,
  foundWords: string[],
  revealedCells: string[],
): string[] {
  const found = [...foundWords];
  const visible = new Set(revealedCells);
  for (const p of level.words) {
    if (found.includes(p.word)) for (const c of wordCells(p)) visible.add(c);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of level.words) {
      if (found.includes(p.word)) continue;
      const cells = wordCells(p);
      if (cells.every((c) => visible.has(c))) {
        found.push(p.word);
        for (const c of cells) visible.add(c);
        changed = true;
      }
    }
  }
  return found;
}

let feedbackCounter = 0;
function fb(kind: Feedback["kind"], word: string): Feedback {
  return { kind, word, n: ++feedbackCounter };
}

function withCompletion(state: JourneyState): JourneyState {
  if (state.foundWords.length < state.level.words.length) return state;
  const status = state.isLastInChapter ? "chapter_done" : "level_done";
  const coinsEarned =
    state.coinsEarned +
    LEVEL_REWARD +
    (status === "chapter_done" ? CHAPTER_REWARD : 0);
  return { ...state, status, coinsEarned, selection: [], tracing: false };
}

function resolve(state: JourneyState, word: string): JourneyState {
  const cleared = { ...state, selection: [], tracing: false };
  if (word.length < MIN_WORD_LEN) {
    return word.length <= 1
      ? cleared
      : { ...cleared, feedback: fb("too_short", word) };
  }

  const gridWords = state.level.words.map((p) => p.word);
  if (gridWords.includes(word)) {
    if (state.foundWords.includes(word)) {
      return { ...cleared, feedback: fb("dupe", word) };
    }
    const foundWords = cascade(
      state.level,
      [...state.foundWords, word],
      state.revealedCells,
    );
    return withCompletion({
      ...cleared,
      foundWords,
      lastFound: word,
      feedback: fb("grid", word),
    });
  }

  if (state.level.bonus.includes(word)) {
    if (state.foundBonus.includes(word)) {
      return { ...cleared, feedback: fb("dupe", word) };
    }
    return {
      ...cleared,
      foundBonus: [...state.foundBonus, word],
      coinsEarned: state.coinsEarned + BONUS_WORD_REWARD,
      feedback: fb("bonus", word),
    };
  }

  return { ...cleared, feedback: fb("invalid", word) };
}

function selectionWord(state: JourneyState): string {
  return state.selection.map((i) => state.level.wheel[i]).join("");
}

export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
): JourneyState {
  const playing = state.status === "playing";
  switch (action.type) {
    case "trace_start":
      if (!playing) return state;
      return { ...state, tracing: true, selection: [action.index], feedback: null };
    case "trace_enter": {
      if (!playing || !state.tracing) return state;
      const sel = state.selection;
      // backtrack: sliding onto the previous letter pops the last one
      if (sel.length >= 2 && sel[sel.length - 2] === action.index) {
        return { ...state, selection: sel.slice(0, -1) };
      }
      if (sel.includes(action.index)) return state;
      return { ...state, selection: [...sel, action.index] };
    }
    case "trace_end":
      if (!state.tracing) return state;
      return resolve(state, selectionWord(state));
    case "trace_cancel":
      return { ...state, selection: [], tracing: false };
    case "key_letter": {
      if (!playing || state.tracing) return state;
      // first unselected wheel instance of this letter
      const index = state.level.wheel.findIndex(
        (l, i) => l === action.letter && !state.selection.includes(i),
      );
      if (index === -1) return state;
      return { ...state, selection: [...state.selection, index], feedback: null };
    }
    case "key_backspace":
      if (!playing || state.tracing) return state;
      return { ...state, selection: state.selection.slice(0, -1) };
    case "key_submit":
      if (!playing || state.tracing || state.selection.length === 0) return state;
      return resolve(state, selectionWord(state));
    case "key_clear":
      return { ...state, selection: [] };
    case "shuffle":
      if (!playing) return state;
      return { ...state, wheelOrder: action.order };
    case "hint": {
      if (!playing || state.revealedCells.includes(action.cell)) return state;
      const revealedCells = [...state.revealedCells, action.cell];
      const before = state.foundWords;
      const foundWords = cascade(state.level, before, revealedCells);
      const completedNow = foundWords.filter((w) => !before.includes(w));
      return withCompletion({
        ...state,
        revealedCells,
        foundWords,
        hintsUsed: state.hintsUsed + 1,
        lastFound: completedNow[completedNow.length - 1] ?? state.lastFound,
      });
    }
    case "clear_feedback":
      return { ...state, feedback: null };
    default:
      return state;
  }
}
