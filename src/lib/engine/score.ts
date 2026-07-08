// Pure tile-scoring for a guess against the answer. Standard Wordle
// duplicate-letter rules via two passes: greens first, then yellows drawn
// from a tally of the answer's unmatched letters. Length-agnostic (4-6).

export type Mark = 0 | 1 | 2; // 0 = grey, 1 = yellow, 2 = green

export const GREY: Mark = 0;
export const YELLOW: Mark = 1;
export const GREEN: Mark = 2;

// Accessible text for each mark, so tile/key state is never colour-only
// (Principle: colour-blind + screen-reader support). Single source of truth
// shared by the board, keyboard, and the live-region announcer.
export const MARK_LABEL: Record<Mark, string> = {
  0: "not in the word",
  1: "wrong spot",
  2: "correct",
};

export function score(guess: string, answer: string): Mark[] {
  if (guess.length !== answer.length) {
    throw new Error(
      `guess length ${guess.length} != answer length ${answer.length}`,
    );
  }
  const n = answer.length;
  const marks: Mark[] = new Array(n).fill(GREY);
  const unmatched: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      marks[i] = GREEN;
    } else {
      unmatched[answer[i]] = (unmatched[answer[i]] ?? 0) + 1;
    }
  }

  for (let i = 0; i < n; i++) {
    if (marks[i] === GREEN) continue;
    const letter = guess[i];
    if ((unmatched[letter] ?? 0) > 0) {
      marks[i] = YELLOW;
      unmatched[letter]--;
    }
  }

  return marks;
}

export function isSolved(marks: Mark[]): boolean {
  return marks.every((m) => m === GREEN);
}
