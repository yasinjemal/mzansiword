// Auditable deterministic randomness. A draw generates a fresh crypto-random
// seed at execution time (not predictable in advance), stores it, and expands
// it deterministically — so anyone with the stored seed and entrant snapshot
// can re-run the draw and get identical winners (CPA verifiability).

import { createHmac, randomBytes } from "node:crypto";

export const DRAW_ALGORITHM = "hmac-sha256-rejection-v1";

export function newSeed(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Uniform integer picker in [0, n): HMAC-SHA256(seed, `label:counter`)
 * truncated to 48 bits with rejection sampling (no modulo bias).
 */
export function makeIntPicker(
  seed: string,
  label: string,
): (n: number) => number {
  let counter = 0;
  return (n: number): number => {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error(`picker range must be a positive integer, got ${n}`);
    }
    const max = 2 ** 48;
    const limit = max - (max % n);
    for (;;) {
      const digest = createHmac("sha256", Buffer.from(seed, "hex"))
        .update(`${label}:${counter++}`)
        .digest();
      const value = digest.readUIntBE(0, 6);
      if (value < limit) return value % n;
    }
  };
}

/** Deterministic Fisher-Yates shuffle; does not mutate the input. */
export function seededShuffle<T>(
  items: readonly T[],
  seed: string,
  label = "shuffle",
): T[] {
  const arr = items.slice();
  const pick = makeIntPicker(seed, label);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
