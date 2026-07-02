import { BACKSPACE, ENTER, keyboardLayout, keyMarks } from "@/lib/engine/keyboard";
import type { TrackCode } from "@/lib/engine/keyboard";
import type { GuessEntry } from "@/lib/game/types";
import type { Mark } from "@/lib/engine/score";

const KEY_MARK_CLASSES: Record<Mark, string> = {
  0: "bg-zinc-500 text-white",
  1: "bg-amber-400 text-white",
  2: "bg-green-600 text-white",
};

export function Keyboard({
  track,
  committed,
  onKey,
  disabled,
}: {
  track: TrackCode;
  committed: GuessEntry[];
  onKey: (key: string) => void;
  disabled: boolean;
}) {
  const marks = keyMarks(committed);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 px-1 select-none">
      {keyboardLayout(track).map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map((key) => {
            const wide = key === ENTER || key === BACKSPACE;
            const mark = marks[key];
            const colour =
              mark !== undefined
                ? KEY_MARK_CLASSES[mark]
                : "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-50";
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                className={`flex h-12 items-center justify-center rounded font-semibold uppercase active:opacity-70 ${
                  wide ? "flex-[1.5] text-xs" : "flex-1 text-base"
                } ${colour}`}
                aria-label={key === BACKSPACE ? "backspace" : key}
              >
                {key === BACKSPACE ? "⌫" : key === ENTER ? "ENTER" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
