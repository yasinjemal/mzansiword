"use client";

import { useMemo } from "react";
import { wordCells } from "@/lib/journey/layout";
import type { JourneyLevel } from "@/lib/journey/types";

interface CellView {
  letter: string;
  inWord: boolean;
  filled: boolean;
  revealed: boolean;
  animIndex: number | null; // stagger index when part of the last-found word
}

export function CrosswordGrid({
  level,
  foundWords,
  revealedCells,
  lastFound,
  targetMode,
  onCellTap,
}: {
  level: JourneyLevel;
  foundWords: string[];
  revealedCells: string[];
  lastFound: string | null;
  targetMode: boolean;
  onCellTap: (cell: string) => void;
}) {
  const cells = useMemo(() => {
    const map = new Map<string, CellView>();
    for (const p of level.words) {
      const keys = wordCells(p);
      const isFound = foundWords.includes(p.word);
      const isLast = p.word === lastFound;
      keys.forEach((k, j) => {
        const prev = map.get(k);
        map.set(k, {
          letter: p.word[j],
          inWord: true,
          filled: (prev?.filled ?? false) || isFound,
          revealed: (prev?.revealed ?? false) || revealedCells.includes(k),
          animIndex: isLast ? j : (prev?.animIndex ?? null),
        });
      });
    }
    return map;
  }, [level, foundWords, revealedCells, lastFound]);

  // cell size: fit width and keep tall grids on screen
  const cellRem = Math.min(2.6, 20 / Math.max(level.gridW, level.gridH));

  const rows = [];
  for (let y = 0; y < level.gridH; y++) {
    for (let x = 0; x < level.gridW; x++) {
      const key = `${x},${y}`;
      const cell = cells.get(key);
      if (!cell) {
        rows.push(<div key={key} />);
        continue;
      }
      const showLetter = cell.filled || cell.revealed;
      const cls = cell.filled
        ? `jcell jcell-filled ${cell.animIndex !== null ? "jcell-fill-anim" : ""}`
        : cell.revealed
          ? "jcell jcell-revealed"
          : "jcell jcell-empty";
      const tappable = targetMode && !showLetter;
      rows.push(
        <div
          key={key}
          onClick={tappable ? () => onCellTap(key) : undefined}
          className={`${cls} ${tappable ? "cursor-pointer ring-2 ring-gold/60" : ""}`}
          style={
            {
              fontSize: `${cellRem * 0.55}rem`,
              "--col": cell.animIndex ?? 0,
            } as React.CSSProperties
          }
        >
          {showLetter ? cell.letter : ""}
        </div>,
      );
    }
  }

  return (
    <div
      className="mx-auto grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${level.gridW}, ${cellRem}rem)`,
        gridAutoRows: `${cellRem}rem`,
      }}
    >
      {rows}
    </div>
  );
}
