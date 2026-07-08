import type { GuessEntry } from "@/lib/game/types";
import { MARK_LABEL, type Mark } from "@/lib/engine/score";

const MARK_CLASS: Record<Mark, string> = {
  0: "tile-absent",
  1: "tile-present",
  2: "tile-correct",
};

function Tile({
  letter,
  mark,
  col,
  reveal,
  dance,
}: {
  letter: string;
  mark: Mark | null;
  col: number;
  reveal: boolean;
  dance: boolean;
}) {
  let cls = "tile";
  if (mark !== null) {
    cls += ` ${MARK_CLASS[mark]} ${reveal ? "tile-reveal" : "tile-settled"}`;
    if (dance) cls += " tile-dance";
  } else if (letter) {
    cls += " tile-filled";
  }
  // A revealed tile's state (correct / wrong spot / not in word) must reach
  // colour-blind and screen-reader players — colour alone is not enough. role
  // "img" + aria-label makes the letter AND its state a single spoken unit.
  const a11y =
    mark !== null
      ? { role: "img", "aria-label": `${letter.toUpperCase()}, ${MARK_LABEL[mark]}` }
      : {};
  return (
    <div
      className={cls}
      style={{ "--col": col } as React.CSSProperties}
      {...a11y}
    >
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
  revealRow,
  danceRow,
}: {
  length: number;
  maxGuesses: number;
  committed: GuessEntry[];
  current: string;
  shaking: boolean;
  /** Row index that flips in (freshly committed this session), or null. */
  revealRow: number | null;
  /** Row index doing the win bounce, or null. */
  danceRow: number | null;
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
            col={c}
            reveal={r === revealRow}
            dance={r === danceRow}
          />
        ))}
      </div>,
    );
  }
  return (
    <div
      className="mx-auto flex w-full flex-col gap-1.5"
      style={{ maxWidth: `${length * 4.1}rem` }}
    >
      {rows}
    </div>
  );
}
