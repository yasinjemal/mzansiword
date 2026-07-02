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

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
