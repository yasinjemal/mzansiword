// Crossword layout: places words on an unbounded plane, first word
// horizontal, every later word crossing an existing one perpendicularly.
// Standard legality rules:
//   a. overlap cells must hold the same letter and may not run in the same
//      direction as an existing word through that cell (crossings only);
//   b. a newly-occupied (non-crossing) cell may not touch an existing cell
//      on either side perpendicular to the word's direction;
//   c. the cells just before the first and just after the last letter must
//      be empty (a word may never extend another);
//   d. the resulting bounding box must fit maxSize × maxSize.
// Unplaceable words are skipped and reported, not fatal.

import type { Dir, PlacedWord } from "./types";

interface Cell {
  letter: string;
  h: boolean; // part of a horizontal word
  v: boolean; // part of a vertical word
}

export interface LayoutResult {
  placed: PlacedWord[];
  skipped: string[];
  gridW: number;
  gridH: number;
}

const key = (x: number, y: number) => `${x},${y}`;

interface Candidate {
  x: number;
  y: number;
  dir: Dir;
  crossings: number;
}

function tryPlacement(
  cells: Map<string, Cell>,
  word: string,
  x: number,
  y: number,
  dir: Dir,
): Candidate | null {
  const dx = dir === "h" ? 1 : 0;
  const dy = dir === "v" ? 1 : 0;

  // rule c: no letter directly before or after the word
  if (cells.has(key(x - dx, y - dy))) return null;
  if (cells.has(key(x + dx * word.length, y + dy * word.length))) return null;

  let crossings = 0;
  for (let j = 0; j < word.length; j++) {
    const cx = x + dx * j;
    const cy = y + dy * j;
    const existing = cells.get(key(cx, cy));
    if (existing) {
      // rule a
      if (existing.letter !== word[j]) return null;
      if (dir === "h" ? existing.h : existing.v) return null;
      crossings++;
    } else {
      // rule b: perpendicular neighbours must be empty
      if (dir === "h") {
        if (cells.has(key(cx, cy - 1)) || cells.has(key(cx, cy + 1))) return null;
      } else {
        if (cells.has(key(cx - 1, cy)) || cells.has(key(cx + 1, cy))) return null;
      }
    }
  }
  if (crossings === 0) return null;
  return { x, y, dir, crossings };
}

function commit(
  cells: Map<string, Cell>,
  word: string,
  x: number,
  y: number,
  dir: Dir,
): void {
  const dx = dir === "h" ? 1 : 0;
  const dy = dir === "v" ? 1 : 0;
  for (let j = 0; j < word.length; j++) {
    const k = key(x + dx * j, y + dy * j);
    const cell = cells.get(k) ?? { letter: word[j], h: false, v: false };
    if (dir === "h") cell.h = true;
    else cell.v = true;
    cells.set(k, cell);
  }
}

/**
 * Lay out words in the given order (put the anchor/longest word first).
 * Deterministic: ties in score resolve by enumeration order.
 */
export function layoutGrid(words: string[], maxSize: number): LayoutResult {
  const cells = new Map<string, Cell>();
  const placed: PlacedWord[] = [];
  const skipped: string[] = [];
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;

  for (const word of words) {
    if (placed.length === 0) {
      commit(cells, word, 0, 0, "h");
      placed.push({ word, x: 0, y: 0, dir: "h" });
      maxX = word.length - 1;
      continue;
    }

    let best: Candidate | null = null;
    let bestScore = -Infinity;

    for (const p of placed) {
      const pdx = p.dir === "h" ? 1 : 0;
      const pdy = p.dir === "v" ? 1 : 0;
      const newDir: Dir = p.dir === "h" ? "v" : "h";
      for (let pi = 0; pi < p.word.length; pi++) {
        const cellX = p.x + pdx * pi;
        const cellY = p.y + pdy * pi;
        for (let wi = 0; wi < word.length; wi++) {
          if (word[wi] !== p.word[pi]) continue;
          const x = newDir === "h" ? cellX - wi : cellX;
          const y = newDir === "v" ? cellY - wi : cellY;
          const cand = tryPlacement(cells, word, x, y, newDir);
          if (!cand) continue;

          const endX = x + (newDir === "h" ? word.length - 1 : 0);
          const endY = y + (newDir === "v" ? word.length - 1 : 0);
          const nMinX = Math.min(minX, x);
          const nMaxX = Math.max(maxX, endX);
          const nMinY = Math.min(minY, y);
          const nMaxY = Math.max(maxY, endY);
          const w = nMaxX - nMinX + 1;
          const h = nMaxY - nMinY + 1;
          if (w > maxSize || h > maxSize) continue; // rule d

          const score = cand.crossings * 10 - w * h - Math.abs(w - h) * 2;
          if (score > bestScore) {
            bestScore = score;
            best = cand;
          }
        }
      }
    }

    if (!best) {
      skipped.push(word);
      continue;
    }
    commit(cells, word, best.x, best.y, best.dir);
    placed.push({ word, x: best.x, y: best.y, dir: best.dir });
    const endX = best.x + (best.dir === "h" ? word.length - 1 : 0);
    const endY = best.y + (best.dir === "v" ? word.length - 1 : 0);
    minX = Math.min(minX, best.x);
    maxX = Math.max(maxX, endX);
    minY = Math.min(minY, best.y);
    maxY = Math.max(maxY, endY);
  }

  // normalize to a (0,0) top-left origin
  for (const p of placed) {
    p.x -= minX;
    p.y -= minY;
  }
  return {
    placed,
    skipped,
    gridW: maxX - minX + 1,
    gridH: maxY - minY + 1,
  };
}

/** Cells of a placed word, as "x,y" keys. */
export function wordCells(p: PlacedWord): string[] {
  const cells: string[] = [];
  for (let j = 0; j < p.word.length; j++) {
    cells.push(
      p.dir === "h" ? key(p.x + j, p.y) : key(p.x, p.y + j),
    );
  }
  return cells;
}
