"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import manifestJson from "@/data/journey/manifest.json";
import { chapterTheme } from "@/lib/journey/chapters";
import { loadLocal, trackProgress } from "@/lib/journey/progress";
import { DEFAULT_TRACK, isLiveTrack } from "@/lib/tracks";
import { CoinsChip } from "@/components/journey/CoinsChip";
import {
  ArrowRightIcon,
  GiftIcon,
  HelpIcon,
  MapIcon,
} from "@/components/icons";
import type { JourneyManifest } from "@/lib/journey/types";

const manifest = manifestJson as JourneyManifest;

const HERO_TILES: { letter: string; cls: string }[] = [
  { letter: "s", cls: "tile-correct" },
  { letter: "h", cls: "tile-present" },
  { letter: "a", cls: "tile-absent" },
  { letter: "r", cls: "tile-correct" },
  { letter: "p", cls: "tile-correct" },
];

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
    <div className="animate-rise flex flex-1 flex-col items-center justify-center gap-7 pb-14 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="mx-auto grid w-60 grid-cols-5 gap-1.5">
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
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Mzansi<span className="text-brand">Word</span>
        </h1>
        <p className="max-w-xs text-balance text-sm text-muted">
          One word a day in your language — plus a journey across Mzansi.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <Link
          href={`/play/${dailyTrack}`}
          className="animate-glow flex cursor-pointer items-center justify-between rounded-2xl bg-brand px-5 py-4 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98]"
        >
          Play today&apos;s word
          <ArrowRightIcon className="h-5 w-5" />
        </Link>

        <Link
          href={`/journey/${journeyTrack}/${journeyLevel}`}
          className="cursor-pointer overflow-hidden rounded-2xl border border-edge text-left transition-transform active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${theme.palette.skyTop} 0%, ${theme.palette.skyBottom} 100%)`,
          }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="flex items-center gap-1.5 font-display text-lg font-semibold">
                <MapIcon className="h-5 w-5" />
                Journey
              </p>
              <p className="text-xs text-white/70">
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
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gold/10 px-4 py-2.5 font-medium text-gold">
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
