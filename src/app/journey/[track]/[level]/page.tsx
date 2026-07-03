import { notFound } from "next/navigation";
import { JourneyGame } from "@/components/journey/JourneyGame";
import { chapterTheme } from "@/lib/journey/chapters";
import {
  addressOf,
  journeyManifest,
  loadChapter,
} from "@/lib/journey/loader";
import { isLiveTrack, TRACK_NAMES } from "@/lib/tracks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; level: string }>;
}) {
  const { track, level } = await params;
  const addr = addressOf(track, Number(level));
  const theme = addr ? chapterTheme(addr.chapterIndex) : null;
  return {
    title: theme
      ? `${theme.name} — Level ${level} · Mzansi Word Journey`
      : "Journey — Mzansi Word",
  };
}

export default async function JourneyLevelPage({
  params,
}: {
  params: Promise<{ track: string; level: string }>;
}) {
  const { track, level } = await params;
  const n = Number(level);
  if (!isLiveTrack(track) || !Number.isInteger(n)) notFound();
  const addr = addressOf(track, n);
  if (!addr) notFound();

  const levels = await loadChapter(track, addr.chapterIndex);
  if (!levels) notFound();

  const entry = journeyManifest.tracks[track];
  const chapterEnd = addr.chapterStartGlobal + levels.length - 1;
  const nextChapterFirstGlobal =
    chapterEnd < entry.totalLevels ? chapterEnd + 1 : null;

  return (
    <JourneyGame
      track={track}
      trackName={TRACK_NAMES[track]}
      levels={levels}
      chapterIndex={addr.chapterIndex}
      chapterStartGlobal={addr.chapterStartGlobal}
      startLevelInChapter={addr.levelInChapter}
      nextChapterFirstGlobal={nextChapterFirstGlobal}
      theme={chapterTheme(addr.chapterIndex)}
    />
  );
}
