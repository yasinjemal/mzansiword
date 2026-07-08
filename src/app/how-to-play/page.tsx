import type { Metadata } from "next";
import { FlameIcon, GiftIcon } from "@/components/icons";

export const metadata: Metadata = { title: "How to play — Mzansi Word" };

function DemoTile({ letter, state }: { letter: string; state: string }) {
  return (
    <span className={`tile tile-settled ${state} !w-10 !text-lg`}>{letter}</span>
  );
}

function DemoRow({
  word,
  states,
}: {
  word: string;
  states: string[];
}) {
  return (
    <div className="flex gap-1.5">
      {word.split("").map((letter, i) => (
        <DemoTile key={i} letter={letter} state={states[i]} />
      ))}
    </div>
  );
}

export default function HowToPlay() {
  return (
    <article className="animate-rise flex flex-col gap-5 pb-10 text-sm leading-6">
      <h1 className="font-display text-2xl font-bold">How to play</h1>
      <p>
        Guess the word of the day in <strong>6 tries</strong>. Everyone in
        South Africa gets the same word — one puzzle per language, per day.
        New word at midnight.
      </p>

      <section className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface p-4">
        <DemoRow
          word="molo"
          states={["tile-correct", "tile-absent", "tile-absent", "tile-present"]}
        />
        <ul className="flex flex-col gap-1.5 text-muted">
          <li>
            <span className="font-semibold text-[#1fa14f]">Green</span> (small
            dot) — right letter, right spot.
          </li>
          <li>
            <span className="font-semibold text-[#d9a514]">Gold</span> (small
            diamond) — in the word, but in another spot.
          </li>
          <li>
            <span className="font-semibold text-foreground/70">Dark</span> (no
            mark) — not in the word at all.
          </li>
        </ul>
      </section>

      <ul className="list-disc space-y-1.5 pl-5">
        <li>Every guess must be a real word in that language.</li>
        <li>The word is 4, 5 or 6 letters — the grid shows you how many.</li>
        <li>
          <strong>Solve it and you&apos;re in the daily airtime draw.</strong>{" "}
          Free to play, no airtime deducted, ever. Solve both languages for
          two entries.
        </li>
      </ul>

      <h2 className="font-display text-lg font-bold">isiXhosa notes</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          Digraphs count as separate letters: <em>hl</em>, <em>dl</em>,{" "}
          <em>ny</em>, <em>ng</em>, <em>th</em>, <em>ph</em>, <em>tsh</em> — so{" "}
          <em>indlu</em> is i-n-d-l-u (5 letters).
        </li>
        <li>
          Clicks (<em>c</em>, <em>x</em>, <em>q</em>) are single letters on the
          normal keyboard.
        </li>
        <li>
          Nouns keep their prefix (<em>indlu</em>, not <em>-ndlu</em>); verbs
          are the simple form ending in -a (<em>hamba</em>, <em>funda</em>).
        </li>
      </ul>

      <h2 className="font-display text-lg font-bold">Streaks &amp; prizes</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-xl bg-gold/10 px-3.5 py-2.5 font-medium text-gold">
          <FlameIcon className="h-5 w-5 shrink-0" />
          Solve at least one language a day to keep your streak alive.
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-brand/10 px-3.5 py-2.5 font-medium text-brand">
          <GiftIcon className="h-5 w-5 shrink-0" />
          Daily draw at 21:00 — two winners get R29 airtime. A 7-day streak
          enters the weekly bonus draw.
        </div>
      </div>
      <p className="text-muted">
        Winners get a message and claim in the app — airtime lands in minutes.
      </p>
    </article>
  );
}
