import type { Metadata } from "next";

export const metadata: Metadata = { title: "How to play — Mzansi Word" };

function Tile({ letter, colour }: { letter: string; colour: string }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded border-2 text-lg font-bold uppercase text-white ${colour}`}
    >
      {letter}
    </span>
  );
}

export default function HowToPlay() {
  return (
    <article className="flex flex-col gap-4 pb-10 text-sm leading-6">
      <h1 className="text-xl font-bold">How to play</h1>
      <p>
        Guess the word of the day in 6 tries. Everyone in South Africa gets
        the same word — one puzzle per language, per day. New puzzle at
        midnight.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Every guess must be a real word in that language.</li>
        <li>The word is 4, 5 or 6 letters — the grid shows you how many.</li>
        <li>
          <strong>Solve it and you&apos;re in the daily airtime draw.</strong>{" "}
          Free to play, no airtime deducted, ever. Solve both languages for two
          entries.
        </li>
      </ul>

      <h2 className="font-bold">The colours</h2>
      <div className="flex items-center gap-2">
        <Tile letter="m" colour="bg-green-600 border-green-600" />
        <span>Right letter, right spot.</span>
      </div>
      <div className="flex items-center gap-2">
        <Tile letter="o" colour="bg-amber-400 border-amber-400" />
        <span>In the word, but in another spot.</span>
      </div>
      <div className="flex items-center gap-2">
        <Tile letter="z" colour="bg-zinc-500 border-zinc-500" />
        <span>Not in the word.</span>
      </div>

      <h2 className="font-bold">isiXhosa notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Digraphs count as separate letters: <em>hl</em>, <em>dl</em>,{" "}
          <em>ny</em>, <em>ng</em>, <em>th</em>, <em>ph</em>, <em>tsh</em> —
          so <em>indlu</em> is i-n-d-l-u (5 letters).
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

      <h2 className="font-bold">Streaks & prizes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Solve at least one language a day to keep your 🔥 streak.</li>
        <li>
          Daily draw at 21:00: two winners get R29 airtime. Keep a 7-day streak
          for the weekly bonus draw.
        </li>
        <li>Winners get a message and claim in the app — airtime lands in minutes.</li>
      </ul>
    </article>
  );
}
