import {
  BACKSPACE,
  ENTER,
  keyboardLayout,
  keyMarks,
} from "@/lib/engine/keyboard";
import type { TrackCode } from "@/lib/engine/keyboard";
import type { GuessEntry } from "@/lib/game/types";
import type { Mark } from "@/lib/engine/score";
import { BackspaceIcon } from "./icons";

const KEY_MARK_CLASS: Record<Mark, string> = {
  0: "key-absent",
  1: "key-present",
  2: "key-correct",
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
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 px-0.5 pb-2 select-none">
      {keyboardLayout(track).map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {i === 1 && <div className="flex-[0.5]" />}
          {row.map((key) => {
            const wide = key === ENTER || key === BACKSPACE;
            const mark = marks[key];
            const markClass = mark !== undefined ? KEY_MARK_CLASS[mark] : "";
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                className={`key ${markClass} ${
                  wide ? "flex-[1.6] text-[0.7rem]" : "flex-1"
                } disabled:opacity-60`}
                aria-label={key === BACKSPACE ? "Backspace" : key}
              >
                {key === BACKSPACE ? (
                  <BackspaceIcon className="h-6 w-6" />
                ) : key === ENTER ? (
                  "ENTER"
                ) : (
                  key
                )}
              </button>
            );
          })}
          {i === 1 && <div className="flex-[0.5]" />}
        </div>
      ))}
    </div>
  );
}
