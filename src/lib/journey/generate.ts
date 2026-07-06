// Assembles chapters of levels from a track's dictionary. Pure and
// deterministic (seeded PRNG) so committed level JSON is reproducible.

import { formable } from "./anagram";
import { layoutGrid } from "./layout";
import { hashSeed, mulberry32, shuffleWith } from "./rng";
import { validateLevel } from "./validate";
import { offensiveSet } from "../wordlist/safety";
import type { JourneyLevel } from "./types";

export const LEVELS_PER_CHAPTER = 12;

export interface ChapterConfig {
  wheelSize: number;
  gridMin: number;
  gridMax: number;
  commonOnly: boolean; // draw base words from the curated answers list only
  maxGridSize: number;
}

// Difficulty curve. Wheels stay 5-6 letters (word lists cap at 6); harder
// chapters get denser grids and rarer base words instead of bigger wheels.
export const CHAPTER_CONFIGS: ChapterConfig[] = [
  { wheelSize: 5, gridMin: 3, gridMax: 4, commonOnly: true, maxGridSize: 9 },
  { wheelSize: 6, gridMin: 4, gridMax: 4, commonOnly: true, maxGridSize: 9 },
  { wheelSize: 6, gridMin: 4, gridMax: 5, commonOnly: true, maxGridSize: 9 },
  { wheelSize: 6, gridMin: 5, gridMax: 6, commonOnly: false, maxGridSize: 9 },
  { wheelSize: 6, gridMin: 6, gridMax: 7, commonOnly: false, maxGridSize: 10 },
];

export interface TrackInput {
  track: string;
  common: string[]; // curated answers list (fair, well-known words)
  all: string[]; // full guess dictionary (answers merged in)
  seed?: string;
  relax?: boolean; // xh escape hatch: thinner requirements, word reuse allowed
}

export interface TrackOutput {
  chapters: JourneyLevel[][];
  report: string[];
}

interface BuildAttempt {
  level: Omit<JourneyLevel, "id">;
  gridWords: string[];
  formableCount: number;
}

function buildLevel(
  base: string,
  dict: readonly string[],
  commonSet: ReadonlySet<string>,
  config: ChapterConfig,
  wordUse: ReadonlyMap<string, number>,
  relax: boolean,
  rand: () => number,
): BuildAttempt | null {
  const fs = formable(base, dict);
  const minBonus = relax ? 0 : 2;
  if (fs.length < config.gridMin + minBonus) return null;

  // candidate grid words: common first (fairer), then longer, then seeded
  const maxUse = relax ? Infinity : 2;
  const candidates = shuffleWith(
    fs.filter((w) => w !== base && (wordUse.get(w) ?? 0) < maxUse),
    rand,
  ).sort(
    (a, b) =>
      Number(commonSet.has(b)) - Number(commonSet.has(a)) ||
      b.length - a.length,
  );

  // grow the selection until the layout fits enough words
  const selected = [base, ...candidates.slice(0, config.gridMax - 1)];
  let next = config.gridMax - 1;
  let layout = layoutGrid(selected, config.maxGridSize);
  while (
    layout.placed.length < config.gridMax &&
    next < candidates.length &&
    selected.length < config.gridMax + 4 // a few spares for unplaceable words
  ) {
    selected.push(candidates[next++]);
    layout = layoutGrid(selected, config.maxGridSize);
  }
  if (layout.placed.length < config.gridMin) return null;

  // keep at most gridMax placed words (layout may have placed spares)
  const placed = layout.placed.slice(0, config.gridMax);
  const finalLayout =
    placed.length === layout.placed.length
      ? layout
      : layoutGrid(
          placed.map((p) => p.word),
          config.maxGridSize,
        );
  if (finalLayout.placed.length < config.gridMin) return null;

  const gridWords = finalLayout.placed.map((p) => p.word);
  const bonus = fs.filter((w) => !gridWords.includes(w)).sort();
  return {
    level: {
      wheel: shuffleWith(base.split(""), rand),
      words: finalLayout.placed,
      gridW: finalLayout.gridW,
      gridH: finalLayout.gridH,
      bonus,
    },
    gridWords,
    formableCount: fs.length,
  };
}

export function generateTrack(input: TrackInput): TrackOutput {
  const { track, relax = false } = input;
  const rand = mulberry32(hashSeed(input.seed ?? `mzansi-journey-${track}`));
  // Offensive words are removed from the candidate pool up front so they can
  // never be picked as a grid or bonus word (CONTENT_PIPELINE.md gate 3); the
  // validateLevel check below is the backstop.
  const blockSet = offensiveSet(track);
  const dict = [...new Set(input.all)]
    .filter((w) => /^[a-z]{4,6}$/.test(w) && !blockSet.has(w))
    .sort();
  const commonSet = new Set(input.common);
  const dictSet = new Set(dict);

  // Keyed by sorted letter signature: anagram bases (stone/notes) would
  // yield the same wheel and formable set — i.e. a duplicate level.
  const usedBases = new Set<string>();
  const signature = (w: string) => [...w].sort().join("");
  const wordUse = new Map<string, number>();
  const chapters: JourneyLevel[][] = [];
  const report: string[] = [];

  for (let c = 0; c < CHAPTER_CONFIGS.length; c++) {
    const config = CHAPTER_CONFIGS[c];
    const pool = shuffleWith(
      dict.filter(
        (w) =>
          w.length === config.wheelSize &&
          !usedBases.has(signature(w)) &&
          (!config.commonOnly || relax || commonSet.has(w)),
      ),
      rand,
    );

    const attempts: BuildAttempt[] = [];
    for (const base of pool) {
      if (attempts.length >= LEVELS_PER_CHAPTER) break;
      // pool was filtered before the loop; an earlier base this chapter may
      // share this base's signature (anagrams), so recheck
      if (usedBases.has(signature(base))) continue;
      const attempt = buildLevel(
        base, dict, commonSet, config, wordUse, relax, rand,
      );
      if (!attempt) continue;
      usedBases.add(signature(base));
      for (const w of attempt.gridWords) {
        wordUse.set(w, (wordUse.get(w) ?? 0) + 1);
      }
      attempts.push(attempt);
    }

    if (attempts.length === 0) {
      report.push(
        `${track} ch${c + 1}: no levels possible (pool ${pool.length}) — stopping`,
      );
      break;
    }

    // difficulty ramp inside the chapter: fewer formable words first
    attempts.sort((a, b) => a.formableCount - b.formableCount);
    const levels = attempts.map((a, i) => {
      const level: JourneyLevel = { id: `${track}-${c + 1}-${i + 1}`, ...a.level };
      const errors = validateLevel(level, dictSet, blockSet);
      if (errors.length > 0) {
        throw new Error(`invalid level ${level.id}: ${errors.join("; ")}`);
      }
      return level;
    });
    chapters.push(levels);
    report.push(
      `${track} ch${c + 1}: ${levels.length}/${LEVELS_PER_CHAPTER} levels, ` +
        `grids ${Math.min(...levels.map((l) => l.words.length))}-` +
        `${Math.max(...levels.map((l) => l.words.length))} words, ` +
        `avg bonus ${(
          levels.reduce((s, l) => s + l.bonus.length, 0) / levels.length
        ).toFixed(1)}`,
    );
    if (levels.length < LEVELS_PER_CHAPTER) {
      report.push(
        `${track} ch${c + 1}: pool exhausted — consider expanding the word list` +
          (relax ? "" : " or rerunning with --relax"),
      );
    }
  }

  return { chapters, report };
}
