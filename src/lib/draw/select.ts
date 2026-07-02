// Pure, reproducible winner selection: given the entrant snapshot and the
// stored seed, this always produces the same winners — run-draw uses it to
// draw and scripts/verify-draw.ts uses it to audit past draws.

import { makeIntPicker } from "./rng";

export interface Entrant {
  user_id: string;
  entry_key: string; // e.g. "<user_id>:<track>" — one entry per solved track
}

/** Canonical order for the stored snapshot (reproducibility requirement). */
export function sortEntrants(entrants: Entrant[]): Entrant[] {
  return [...entrants].sort((a, b) => a.entry_key.localeCompare(b.entry_key));
}

/**
 * Draw up to `count` distinct winners. Each entry is one ticket; when a
 * ticket is drawn, all of that user's tickets are removed before the next
 * pick.
 */
export function selectWinners(
  entrants: Entrant[],
  seed: string,
  count: number,
): string[] {
  const remaining = sortEntrants(entrants);
  const winners: string[] = [];
  const pick = makeIntPicker(seed, "winners");
  while (winners.length < count && remaining.length > 0) {
    const winner = remaining[pick(remaining.length)].user_id;
    winners.push(winner);
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (remaining[i].user_id === winner) remaining.splice(i, 1);
    }
  }
  return winners;
}
