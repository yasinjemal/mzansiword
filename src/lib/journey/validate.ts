// Level validator, shared by the generation script and a data test that
// runs over every committed level JSON. The script refuses to emit levels
// that fail any check here.

import { canForm, letterCounts } from "./anagram";
import { wordCells } from "./layout";
import type { JourneyLevel } from "./types";

export function validateLevel(
  level: JourneyLevel,
  dictionary?: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const wheelCounts = letterCounts(level.wheel.join(""));
  const gridWords = level.words.map((w) => w.word);

  if (level.words.length === 0) errors.push("no grid words");
  if (new Set(gridWords).size !== gridWords.length) {
    errors.push("duplicate grid words");
  }
  for (const b of level.bonus) {
    if (gridWords.includes(b)) errors.push(`bonus word ${b} also in grid`);
  }
  if (new Set(level.bonus).size !== level.bonus.length) {
    errors.push("duplicate bonus words");
  }

  for (const w of [...gridWords, ...level.bonus]) {
    if (!/^[a-z]{4,6}$/.test(w)) errors.push(`bad word: ${w}`);
    if (!canForm(w, wheelCounts)) errors.push(`${w} not formable from wheel`);
    if (dictionary && !dictionary.has(w)) errors.push(`${w} not in dictionary`);
  }

  // replay the grid: letters consistent, no same-direction overlap, in bounds
  const cells = new Map<string, { letter: string; h: boolean; v: boolean }>();
  for (const p of level.words) {
    const keys = wordCells(p);
    for (let j = 0; j < keys.length; j++) {
      const [x, y] = keys[j].split(",").map(Number);
      if (x < 0 || y < 0 || x >= level.gridW || y >= level.gridH) {
        errors.push(`${p.word} out of bounds at ${keys[j]}`);
      }
      const cell = cells.get(keys[j]);
      if (cell) {
        if (cell.letter !== p.word[j]) {
          errors.push(`letter clash at ${keys[j]}`);
        }
        if (p.dir === "h" ? cell.h : cell.v) {
          errors.push(`same-direction overlap at ${keys[j]}`);
        }
      }
      const next = cell ?? { letter: p.word[j], h: false, v: false };
      if (p.dir === "h") next.h = true;
      else next.v = true;
      cells.set(keys[j], next);
    }
  }

  // connectivity: every word crosses ≥1 other; single component
  if (level.words.length > 1) {
    const cellOwners = new Map<string, number[]>();
    level.words.forEach((p, i) => {
      for (const k of wordCells(p)) {
        cellOwners.set(k, [...(cellOwners.get(k) ?? []), i]);
      }
    });
    const adj: Set<number>[] = level.words.map(() => new Set());
    for (const owners of cellOwners.values()) {
      if (owners.length > 1) {
        for (const a of owners) for (const b of owners) if (a !== b) adj[a].add(b);
      }
    }
    const seen = new Set<number>([0]);
    const queue = [0];
    while (queue.length) {
      for (const n of adj[queue.pop()!]) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    if (seen.size !== level.words.length) {
      errors.push("grid not connected");
    }
    adj.forEach((a, i) => {
      if (a.size === 0) errors.push(`${level.words[i].word} crosses nothing`);
    });
  }

  return errors;
}
