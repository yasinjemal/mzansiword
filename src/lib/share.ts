import type { GuessEntry } from "./game/types";

// Spoiler-free result card: emoji only, no letters.
const MARK_EMOJI = ["⬛", "🟨", "🟩"] as const;

export function buildShareText(opts: {
  trackName: string;
  puzzleNumber: number;
  guesses: GuessEntry[];
  solved: boolean;
  maxGuesses: number;
  streak: number;
  url: string;
}): string {
  const result = opts.solved
    ? `${opts.guesses.length}/${opts.maxGuesses}`
    : `X/${opts.maxGuesses}`;
  const streakPart = opts.solved && opts.streak > 1 ? ` 🔥${opts.streak}` : "";
  const grid = opts.guesses
    .map((g) => g.marks.map((m) => MARK_EMOJI[m]).join(""))
    .join("\n");
  return (
    `Mzansi Word 🇿🇦 ${opts.trackName} #${opts.puzzleNumber} ${result}${streakPart}\n` +
    `${grid}\n` +
    `Free daily word game — solve it & you're in the airtime draw 🎉\n` +
    opts.url
  );
}

// Friend-challenge message (RFC-0004): the spoiler-free grid + a "beat me"
// framing + the deep link that already carries the challenge token in `url`.
// Same spoiler guarantee as buildShareText — emoji marks only, never letters.
export function buildChallengeText(opts: {
  name: string;
  trackName: string;
  puzzleNumber: number;
  guesses: GuessEntry[];
  solved: boolean;
  maxGuesses: number;
  url: string;
}): string {
  const result = opts.solved
    ? `${opts.guesses.length}/${opts.maxGuesses}`
    : `X/${opts.maxGuesses}`;
  const who = opts.name ? `${opts.name} got` : "I got";
  const grid = opts.guesses
    .map((g) => g.marks.map((m) => MARK_EMOJI[m]).join(""))
    .join("\n");
  return (
    `${who} Mzansi Word 🇿🇦 ${opts.trackName} #${opts.puzzleNumber} in ${result}\n` +
    `${grid}\n` +
    `Think you're sharper? Beat me 👀\n` +
    opts.url
  );
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
