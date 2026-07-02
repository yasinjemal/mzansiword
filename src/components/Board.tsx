import type { GuessEntry } from "@/lib/game/types";
import type { Mark } from "@/lib/engine/score";

const MARK_CLASSES: Record<Mark, string> = {
  0: "bg-zinc-500 border-zinc-500 text-white",
  1: "bg-amber-400 border-amber-400 text-white",
  2: "bg-green-600 border-green-600 text-white",
};

function Tile({
  letter,
  mark,
  delayMs,
}: {
  letter: string;
  mark: Mark | null;
  delayMs: number;
}) {
  const base =
    "flex aspect-square w-full items-center justify-center rounded border-2 text-2xl font-bold uppercase transition-colors duration-500";
  const state =
    mark !== null
      ? MARK_CLASSES[mark]
      : letter
        ? "border-zinc-400 dark:border-zinc-500"
        : "border-zinc-200 dark:border-zinc-700";
  return (
    <div className={`${base} ${state}`} style={{ transitionDelay: `${delayMs}ms` }}>
      {letter}
    </div>
  );
}

export function Board({
  length,
  maxGuesses,
  committed,
  current,
  shaking,
}: {
  length: number;
  maxGuesses: number;
  committed: GuessEntry[];
  current: string;
  shaking: boolean;
}) {
  const rows = [];
  for (let r = 0; r < maxGuesses; r++) {
    const entry = committed[r];
    const isCurrent = r === committed.length;
    const word = entry ? entry.word : isCurrent ? current : "";
    rows.push(
      <div
        key={r}
        className={`grid gap-1.5 ${isCurrent && shaking ? "animate-shake" : ""}`}
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length }, (_, c) => (
          <Tile
            key={c}
            letter={word[c] ?? ""}
            mark={entry ? entry.marks[c] : null}
            delayMs={entry ? c * 120 : 0}
          />
        ))}
      </div>,
    );
  }
  return (
    <div
      className="mx-auto flex w-full flex-col gap-1.5"
      style={{ maxWidth: `${length * 4}rem` }}
    >
      {rows}
    </div>
  );
}
