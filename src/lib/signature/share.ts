// Spoiler-free, WhatsApp-ready share card for a Signature Moment.
// The moment and its share are the same event (Bible §6.5 rule 3): a personal
// high becomes someone else's first touch.

import type { SignatureMoment } from "./types";

export function buildMomentShareText(
  moment: SignatureMoment,
  url: string,
): string {
  return (
    `${moment.emoji} Mzansi Word 🇿🇦\n` +
    `${moment.title}\n` +
    `${moment.line}\n\n` +
    `Free daily word game in SA's languages — come play & win airtime 🎉\n` +
    url
  );
}
