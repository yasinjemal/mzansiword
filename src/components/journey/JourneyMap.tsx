"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoinsChip } from "./CoinsChip";
import { ArrowRightIcon, LockIcon } from "../icons";
import { chapterTheme } from "@/lib/journey/chapters";
import { loadLocal, syncWithServer, trackProgress } from "@/lib/journey/progress";
import { LIVE_TRACKS } from "@/lib/tracks";
import type { ChapterManifestEntry } from "@/lib/journey/types";

function chapterRanges(chapters: ChapterManifestEntry[]) {
  let offset = 0;
  return chapters.map((ch) => {
    const start = offset + 1;
    offset += ch.levelCount;
    return { ch, start, end: offset };
  });
}

export function JourneyMap({
  track,
  trackName,
  chapters,
  totalLevels,
}: {
  track: string;
  trackName: string;
  chapters: ChapterManifestEntry[];
  totalLevels: number;
}) {
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // client-only hydration from localStorage, then async server reconcile
    /* eslint-disable react-hooks/set-state-in-effect */
    const local = loadLocal();
    setLevelsCompleted(trackProgress(local, track).levelsCompleted);
    setCoins(local.coins);
    /* eslint-enable react-hooks/set-state-in-effect */
    try {
      localStorage.setItem("mw:journeyTrack", track);
    } catch {}
    // reconcile with the server ledger (guest import / server-wins)
    let cancelled = false;
    void syncWithServer().then((synced) => {
      if (cancelled) return;
      setLevelsCompleted(trackProgress(synced, track).levelsCompleted);
      setCoins(synced.coins);
    });
    return () => {
      cancelled = true;
    };
  }, [track]);

  const nextLevel = Math.min(levelsCompleted + 1, totalLevels);
  const allDone = levelsCompleted >= totalLevels;

  const cards = chapterRanges(chapters).map(({ ch, start, end }) => {
    const theme = chapterTheme(ch.index);
    const completedHere = Math.min(
      Math.max(levelsCompleted - (start - 1), 0),
      ch.levelCount,
    );
    const unlocked = levelsCompleted >= start - 1;
    const active = unlocked && completedHere < ch.levelCount;

    return (
      <Link
        key={ch.index}
        href={unlocked ? `/journey/${track}/${Math.max(start, Math.min(levelsCompleted + 1, end))}` : "#"}
        aria-disabled={!unlocked}
        onClick={unlocked ? undefined : (e) => e.preventDefault()}
        className={`relative overflow-hidden rounded-2xl border p-4 transition-transform ${
          unlocked
            ? "cursor-pointer border-edge active:scale-[0.99]"
            : "cursor-not-allowed border-edge/50 opacity-60"
        } ${active ? "animate-glow" : ""}`}
        style={{
          background: `linear-gradient(135deg, ${theme.palette.skyTop} 0%, ${theme.palette.skyBottom} 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold">{theme.name}</p>
            <p className="text-xs text-white/70">{theme.blurb}</p>
            {theme.sponsor && (
              <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-white/60">
                In partnership with {theme.sponsor.name}
              </p>
            )}
          </div>
          {unlocked ? (
            <div className="text-right">
              <p
                className="font-display text-xl font-bold"
                style={{ color: theme.palette.accent }}
              >
                {completedHere}/{ch.levelCount}
              </p>
              <p className="text-[0.65rem] text-white/60">levels</p>
            </div>
          ) : (
            <LockIcon className="h-6 w-6 text-white/60" />
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(completedHere / ch.levelCount) * 100}%`,
              background: theme.palette.accent,
            }}
          />
        </div>
      </Link>
    );
  });

  return (
    <div className="animate-rise flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Journey</h1>
        <CoinsChip coins={coins} />
      </div>

      <div className="flex gap-1.5">
        {LIVE_TRACKS.map(({ code, name }) => (
          <Link
            key={code}
            href={`/journey/${code}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              code === track
                ? "bg-brand text-[#0b1210]"
                : "bg-raised text-muted hover:text-foreground"
            }`}
          >
            {name}
          </Link>
        ))}
      </div>

      {!allDone ? (
        <Link
          href={`/journey/${track}/${nextLevel}`}
          className="animate-glow flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98]"
        >
          {levelsCompleted === 0 ? "Start the journey" : `Continue — Level ${nextLevel}`}
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      ) : (
        <p className="rounded-xl bg-gold/10 px-4 py-3 text-center text-sm font-semibold text-gold">
          All {totalLevels} {trackName} levels cleared — more chapters coming
          soon!
        </p>
      )}

      <div className="flex flex-col gap-3">{cards}</div>

      {track === "xh" && totalLevels < 60 && (
        <p className="text-center text-xs text-muted">
          More isiXhosa chapters are on the way as our word list grows.
        </p>
      )}
    </div>
  );
}
