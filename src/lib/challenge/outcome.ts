import type { Challenge } from "./token";

export type Outcome = "win" | "loss" | "draw";

/**
 * Head-to-head result of MY play vs the challenger's on the same puzzle
 * (RFC-0004). The metric is guess count: fewer wins, a solve always beats a fail,
 * an equal count (both solved in N, or both failed) is a draw. `mine.solved=false`
 * means I failed (X/6); a `challenge.guesses` of 0 means the challenger failed.
 */
export function challengeOutcome(
  mine: { solved: boolean; guesses: number },
  challenge: Challenge,
): Outcome {
  const myFail = !mine.solved;
  const theirFail = challenge.guesses === 0;
  if (myFail && theirFail) return "draw";
  if (myFail) return "loss"; // they solved, I didn't
  if (theirFail) return "win"; // I solved, they didn't
  if (mine.guesses < challenge.guesses) return "win";
  if (mine.guesses > challenge.guesses) return "loss";
  return "draw";
}
