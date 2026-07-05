// Client-side Signature Moments store.
//
// Owns (a) the award ledger — which moments a player has earned — and (b) the
// lightweight cumulative counters that feed detection (words discovered, daily
// solves, journey levels/chapters). Guests live entirely in localStorage;
// logged-in players additionally mirror awards to the server (best-effort) so
// moments follow them across devices.
//
// Client-authoritative by design: no prize/economy value is attached to a
// moment, so — exactly like Journey — the client resolves everything locally
// (Bible §13). The server is a mirror, never a gate.

import { detectNewMoments } from "./detect";
import type { PlayerSnapshot, SignatureMoment } from "./types";

const KEY = "mw:signature:v1";

interface SigState {
  awarded: string[];
  dailySolves: number;
  wordsDiscovered: number;
  journeyLevels: number;
  chaptersDone: number;
}

const EMPTY: SigState = {
  awarded: [],
  dailySolves: 0,
  wordsDiscovered: 0,
  journeyLevels: 0,
  chaptersDone: 0,
};

function load(): SigState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<SigState>;
    return {
      awarded: Array.isArray(parsed.awarded) ? parsed.awarded : [],
      dailySolves: parsed.dailySolves ?? 0,
      wordsDiscovered: parsed.wordsDiscovered ?? 0,
      journeyLevels: parsed.journeyLevels ?? 0,
      chaptersDone: parsed.chaptersDone ?? 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(state: SigState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

/** Merge server-known awards in (call once on load for logged-in players). */
export function mergeServerAwards(ids: string[]) {
  const state = load();
  const set = new Set(state.awarded);
  let changed = false;
  for (const id of ids) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (changed) save({ ...state, awarded: [...set] });
}

async function postAwards(ids: string[]) {
  try {
    await fetch("/api/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  } catch {
    // best-effort; local ledger already has them
  }
}

function commit(
  state: SigState,
  snapshot: PlayerSnapshot,
  authed: boolean,
): SignatureMoment[] {
  const earned = detectNewMoments(snapshot, new Set(state.awarded));
  if (earned.length === 0) {
    save(state);
    return [];
  }
  const ids = earned.map((m) => m.id);
  save({ ...state, awarded: [...state.awarded, ...ids] });
  if (authed) void postAwards(ids);
  return earned;
}

/**
 * Record a finished daily solve and return any newly-earned moments.
 * `wordsAdded` defaults to 1 (the solved answer).
 */
export function recordDailySolve(
  opts: {
    currentStreak: number;
    bestStreak?: number;
    guessCount: number;
    wordsAdded?: number;
  },
  authed: boolean,
): SignatureMoment[] {
  const state = load();
  state.dailySolves += 1;
  state.wordsDiscovered += opts.wordsAdded ?? 1;
  const snapshot: PlayerSnapshot = {
    currentStreak: opts.currentStreak,
    bestStreak: opts.bestStreak ?? opts.currentStreak,
    dailySolves: state.dailySolves,
    lastGuessCount: opts.guessCount,
    wordsDiscovered: state.wordsDiscovered,
    journeyLevels: state.journeyLevels,
    chaptersDone: state.chaptersDone,
  };
  return commit(state, snapshot, authed);
}

/**
 * Record Journey progress (a completed level, its new words, and whether it
 * closed a chapter) and return any newly-earned moments. Wired in the Journey
 * follow-up slice; the engine is shared so no new detection code is needed.
 */
export function recordJourneyProgress(
  opts: {
    levelsCompleted: number;
    chaptersCompleted: number;
    wordsAdded: number;
    currentStreak?: number;
    bestStreak?: number;
  },
  authed: boolean,
): SignatureMoment[] {
  const state = load();
  state.journeyLevels = Math.max(state.journeyLevels, opts.levelsCompleted);
  state.chaptersDone = Math.max(state.chaptersDone, opts.chaptersCompleted);
  state.wordsDiscovered += Math.max(0, opts.wordsAdded);
  const snapshot: PlayerSnapshot = {
    currentStreak: opts.currentStreak ?? 0,
    bestStreak: opts.bestStreak ?? opts.currentStreak ?? 0,
    dailySolves: state.dailySolves,
    lastGuessCount: null,
    wordsDiscovered: state.wordsDiscovered,
    journeyLevels: state.journeyLevels,
    chaptersDone: state.chaptersDone,
  };
  return commit(state, snapshot, authed);
}
