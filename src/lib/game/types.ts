import type { Mark } from "../engine/score";
import type { TrackCode } from "../engine/keyboard";

export const MAX_GUESSES = 6;

export interface GuessEntry {
  word: string;
  marks: Mark[];
}

/** Everything the client may know about today's play. Never the answer. */
export interface PlayStateDto {
  track: TrackCode;
  puzzleDate: string;
  puzzleNumber: number;
  length: number;
  maxGuesses: number;
  guesses: GuessEntry[];
  solved: boolean;
  gameOver: boolean;
}

export interface GuessResponse {
  marks: Mark[];
  solved: boolean;
  gameOver: boolean;
  streak: number;
  /** Streak shields remaining after this solve (RFC-0002 B1). */
  shields: number;
  /** True if a shield was spent to save the streak on this solve. */
  shieldUsed: boolean;
}
