"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import manifestJson from "@/data/journey/manifest.json";
import { chapterTheme } from "@/lib/journey/chapters";
import { silhouettePath } from "@/lib/journey/silhouettes";
import { loadLocal, trackProgress } from "@/lib/journey/progress";
import { DEFAULT_TRACK, isLiveTrack } from "@/lib/tracks";
import { CoinsChip } from "@/components/journey/CoinsChip";
import { ChapterScene } from "@/components/journey/ChapterScene";
import {
  ArrowRightIcon,
  GiftIcon,
  HelpIcon,
  MapIcon,
} from "@/components/icons";
import type { JourneyManifest } from "@/lib/journey/types";

const manifest = manifestJson as JourneyManifest;

const HERO_TILES: { letter: string; cls: string }[] = [
  { letter: "m", cls: "tile-correct" },
  { letter: "z", cls: "tile-present" },
  { letter: "a", cls: "tile-correct" },
  { letter: "n", cls: "tile-absent" },
  { letter: "s", cls: "tile-correct" },
  { letter: "i", cls: "tile-present" },
];

/** Iconic hero: Table Mountain at dusk under a gold sun, bunting strung
 *  across the top. Pure CSS/SVG — no image request. */
function HeroScene() {
  return (
    <div
      className="relative h-40 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #171130 0%, #3d2350 42%, #7a3b2e 76%, #b06a2c 100%)",
        }}
      />
      <svg
        className="absolute inset-x-0 top-0 h-1/2 w-full opacity-70"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        {[
          [8, 9],
          [18, 5],
          [31, 14],
          [46, 7],
          [62, 11],
          [76, 4],
          [90, 9],
          [97, 16],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.55 : 0.35} fill="#f7f3ea" />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-[46%] h-20 w-20 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, #ffe9ad 0%, #ffb612 58%, #e2725b 100%)",
          boxShadow: "0 0 46px 10px rgba(255, 182, 18, 0.45)",
        }}
      />
      <svg
        className="absolute left-[16%] top-[30%] h-3 w-9 text-black/50"
        viewBox="0 0 40 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M2 8q4-5 8 0M10 8q4-5 8 0" />
        <path d="M24 5q3-4 6 0M30 5q3-4 6 0" />
      </svg>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[-10%] h-[66%] w-[120%] opacity-50"
      >
        <path d={silhouettePath("table-mountain")} fill="#160f20" />
      </svg>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-[52%] w-full"
      >
        <path d={silhouettePath("table-mountain")} fill="#0e0a15" />
      </svg>
      <div className="pattern-band absolute inset-x-0 top-0" />
    </div>
  );
}

export default function Home() {
  const [dailyTrack, setDailyTrack] = useState(DEFAULT_TRACK as string);
  const [journeyTrack, setJourneyTrack] = useState("en");
  const [journeyLevel, setJourneyLevel] = useState(1);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    // client-only hydration from localStorage
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const last = localStorage.getItem("mw:lastTrack");
      if (last && isLiveTrack(last)) setDailyTrack(last);
      const jt = localStorage.getItem("mw:journeyTrack");
      const journey = jt && isLiveTrack(jt) ? jt : "en";
      setJourneyTrack(journey);
      const local = loadLocal();
      setCoins(local.coins);
      const done = trackProgress(local, journey).levelsCompleted;
      const total = manifest.tracks[journey]?.totalLevels ?? 1;
      setJourneyLevel(Math.min(done + 1, total));
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // which chapter the journey CTA lands in (for its art)
  const entry = manifest.tracks[journeyTrack];
  let chapterIndex = 1;
  if (entry) {
    let offset = 0;
    for (const ch of entry.chapters) {
      if (journeyLevel <= offset + ch.levelCount) {
        chapterIndex = ch.index;
        break;
      }
      offset += ch.levelCount;
    }
  }
  const theme = chapterTheme(chapterIndex);

  return (
    <div className="animate-rise flex flex-1 flex-col items-center justify-center gap-6 pb-14 text-center">
      <div className="w-full">
        <HeroScene />
        <div className="relative z-10 mx-auto -mt-8 grid w-72 grid-cols-6 gap-1.5">
          {HERO_TILES.map((t, i) => (
            <div
              key={i}
              className={`tile tile-reveal ${t.cls}`}
              style={{ "--col": i } as React.CSSProperties}
            >
              {t.letter}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="font-display text-[2.75rem] font-extrabold leading-none tracking-tight">
          Mzansi<span className="text-gold-grad">Word</span>
        </h1>
        <p className="max-w-xs text-balance text-sm text-muted">
          One word a day in your language — plus a journey across Mzansi.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <Link
          href={`/play/${dailyTrack}`}
          className="btn-primary animate-glow flex cursor-pointer items-center justify-between rounded-2xl px-5 py-4 font-display text-lg font-bold"
        >
          Play today&apos;s word
          <ArrowRightIcon className="h-5 w-5" />
        </Link>

        <Link
          href={`/journey/${journeyTrack}/${journeyLevel}`}
          className="press-spring relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 text-left shadow-lg shadow-black/30"
        >
          <ChapterScene theme={theme} />
          <div className="relative z-10 flex items-center justify-between px-5 py-5">
            <div>
              <p className="flex items-center gap-1.5 font-display text-lg font-bold">
                <MapIcon className="h-5 w-5" />
                Journey
              </p>
              <p className="text-xs text-white/75">
                {theme.name} · Level {journeyLevel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {coins !== null && <CoinsChip coins={coins} />}
              <ArrowRightIcon className="h-5 w-5" />
            </div>
          </div>
        </Link>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 text-sm">
        <div className="chip-glass flex items-center justify-center gap-2 rounded-xl border-gold/25 px-4 py-2.5 font-medium text-gold">
          <GiftIcon className="h-4 w-4 shrink-0" />
          Free forever · R29 airtime draw every night at 21:00
        </div>
        <Link
          href="/how-to-play"
          className="flex cursor-pointer items-center justify-center gap-1.5 py-1 text-muted transition-colors hover:text-foreground"
        >
          <HelpIcon className="h-4 w-4" />
          How to play
        </Link>
      </div>
    </div>
  );
}
