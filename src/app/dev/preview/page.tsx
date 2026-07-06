"use client";

// Dev-only gallery for states that are hard to reach in normal play:
// streak shields (RFC-0002 B1), "Streak saved!", Perfect Week (RFC-0003), and
// friend-challenge head-to-heads (RFC-0004). Not reachable in production.
// Visit http://localhost:3000/dev/preview

import { notFound } from "next/navigation";
import { useState } from "react";
import { ResultPanel } from "@/components/ResultPanel";
import { PerfectWeekCard } from "@/components/PerfectWeekCard";
import { ShieldPips } from "@/components/ShieldPips";
import type { GuessEntry } from "@/lib/game/types";
import type { Mark } from "@/lib/engine/score";
import type { Challenge } from "@/lib/challenge/token";

const g = (marks: Mark[]): GuessEntry => ({ word: "abcdef".slice(0, marks.length), marks });

// Won in 3.
const WIN3: GuessEntry[] = [
  g([0, 1, 0, 2, 1, 0]),
  g([1, 2, 0, 2, 2, 0]),
  g([2, 2, 2, 2, 2, 2]),
];
// Won in 2.
const WIN2: GuessEntry[] = [g([1, 1, 0, 2, 0, 1]), g([2, 2, 2, 2, 2, 2])];
// Won in 4.
const WIN4: GuessEntry[] = [
  g([0, 0, 1, 0, 1, 0]),
  g([1, 1, 0, 2, 0, 1]),
  g([1, 2, 2, 2, 2, 0]),
  g([2, 2, 2, 2, 2, 2]),
];

const sipho = (guesses: number): Challenge => ({ name: "Sipho", puzzle: 6, guesses });

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex w-full max-w-md flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const [perfectWeek, setPerfectWeek] = useState<number | null>(null);

  const base = {
    track: "xh" as const,
    trackName: "isiXhosa",
    puzzleNumber: 6,
    maxGuesses: 6,
    playerName: "Lerato",
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">UI preview (dev only)</h1>
        <p className="text-sm text-muted">
          States that are hard to reach by playing. RFC-0002 B1 · 0003 · 0004.
        </p>
      </div>

      <Panel title="Streak shields — ShieldPips (held 2 / 1 / 0)">
        <div className="flex items-center gap-6 rounded-2xl border border-edge bg-surface p-4">
          <ShieldPips held={2} />
          <ShieldPips held={1} />
          <ShieldPips held={0} />
        </div>
      </Panel>

      <Panel title="Perfect Week card (RFC-0003)">
        <button
          type="button"
          onClick={() => setPerfectWeek(14)}
          className="btn-primary rounded-xl px-4 py-2.5 font-display font-semibold"
        >
          Show Perfect Week (14-day)
        </button>
      </Panel>

      <Panel title="Result — normal win (streak 5, 2 shields)">
        <ResultPanel {...base} won guesses={WIN3} streak={5} shields={2} shieldUsed={false} challenge={null} />
      </Panel>

      <Panel title="Result — Streak saved! (shield bridged a gap)">
        <ResultPanel {...base} won guesses={WIN3} streak={5} shields={1} shieldUsed={true} challenge={null} />
      </Panel>

      <Panel title="Challenge — you WIN (2 vs Sipho's 3)">
        <ResultPanel {...base} won guesses={WIN2} streak={3} shields={2} shieldUsed={false} challenge={sipho(3)} />
      </Panel>

      <Panel title="Challenge — you LOSE (4 vs Sipho's 2)">
        <ResultPanel {...base} won guesses={WIN4} streak={3} shields={2} shieldUsed={false} challenge={sipho(2)} />
      </Panel>

      <Panel title="Challenge — DRAW (3 vs 3)">
        <ResultPanel {...base} won guesses={WIN3} streak={3} shields={2} shieldUsed={false} challenge={sipho(3)} />
      </Panel>

      {perfectWeek !== null && (
        <PerfectWeekCard streak={perfectWeek} onDone={() => setPerfectWeek(null)} />
      )}
    </div>
  );
}
