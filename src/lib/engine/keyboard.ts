// On-screen keyboard layouts, keyed by track so a future language can
// reorder or annotate keys. isiXhosa digraphs (hl, dl, ny, ng, th, ph) are
// typed letter by letter and click consonants (c, x, q) are ordinary
// letters, so plain QWERTY serves every launch track.

import type { Mark } from "./score";

export const TRACK_CODES = ["en", "xh", "zu", "af"] as const;
export type TrackCode = (typeof TRACK_CODES)[number];

export function isTrackCode(value: string): value is TrackCode {
  return (TRACK_CODES as readonly string[]).includes(value);
}

export const ENTER = "enter";
export const BACKSPACE = "back";

const QWERTY: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  [ENTER, "z", "x", "c", "v", "b", "n", "m", BACKSPACE],
];

export function keyboardLayout(_track: TrackCode): string[][] {
  return QWERTY;
}

/** Best mark seen per letter across all scored guesses, for key colouring. */
export function keyMarks(
  guesses: { word: string; marks: Mark[] }[],
): Record<string, Mark> {
  const best: Record<string, Mark> = {};
  for (const { word, marks } of guesses) {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (best[letter] === undefined || marks[i] > best[letter]) {
        best[letter] = marks[i];
      }
    }
  }
  return best;
}
