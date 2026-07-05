// Pure detection: given a player snapshot and the moments already awarded,
// return the moments newly earned right now, ordered spark → legend.
// No I/O — fully unit-testable (see detect.test.ts).

import type { PlayerSnapshot, SignatureMoment } from "./types";
import { activeMoments, byTierAscending } from "./catalog";

export function detectNewMoments(
  snapshot: PlayerSnapshot,
  awarded: ReadonlySet<string>,
): SignatureMoment[] {
  return activeMoments()
    .filter((m) => !awarded.has(m.id) && m.test!(snapshot))
    .sort(byTierAscending);
}
