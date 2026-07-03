import "server-only";

// Server-side chapter loading for the RSC play route. Explicit import map
// (not template-literal dynamic imports) so the bundler statically includes
// exactly the committed chapters. When `generate-journey` emits new chapter
// files, add them here — the journey-data test + manifest keep this honest.

import manifestJson from "@/data/journey/manifest.json";
import type { JourneyLevel, JourneyManifest } from "./types";

export const journeyManifest = manifestJson as JourneyManifest;

type ChapterModule = { default: JourneyLevel[] };

const chapterImports: Record<
  string,
  Record<number, () => Promise<ChapterModule>>
> = {
  en: {
    1: () => import("@/data/journey/en/chapter-1.json") as Promise<ChapterModule>,
    2: () => import("@/data/journey/en/chapter-2.json") as Promise<ChapterModule>,
    3: () => import("@/data/journey/en/chapter-3.json") as Promise<ChapterModule>,
    4: () => import("@/data/journey/en/chapter-4.json") as Promise<ChapterModule>,
    5: () => import("@/data/journey/en/chapter-5.json") as Promise<ChapterModule>,
  },
  xh: {
    1: () => import("@/data/journey/xh/chapter-1.json") as Promise<ChapterModule>,
    2: () => import("@/data/journey/xh/chapter-2.json") as Promise<ChapterModule>,
    3: () => import("@/data/journey/xh/chapter-3.json") as Promise<ChapterModule>,
  },
};

export interface LevelAddress {
  chapterIndex: number; // 1-based
  levelInChapter: number; // 1-based
  isLastInChapter: boolean;
  isLastLevel: boolean;
  chapterStartGlobal: number; // global level number of this chapter's level 1
}

/** Map a global 1-based level number to its chapter address. */
export function addressOf(track: string, globalLevel: number): LevelAddress | null {
  const entry = journeyManifest.tracks[track];
  if (!entry || globalLevel < 1 || globalLevel > entry.totalLevels) return null;
  let offset = 0;
  for (const ch of entry.chapters) {
    if (globalLevel <= offset + ch.levelCount) {
      const levelInChapter = globalLevel - offset;
      return {
        chapterIndex: ch.index,
        levelInChapter,
        isLastInChapter: levelInChapter === ch.levelCount,
        isLastLevel: globalLevel === entry.totalLevels,
        chapterStartGlobal: offset + 1,
      };
    }
    offset += ch.levelCount;
  }
  return null;
}

export async function loadChapter(
  track: string,
  chapterIndex: number,
): Promise<JourneyLevel[] | null> {
  const load = chapterImports[track]?.[chapterIndex];
  if (!load) return null;
  return (await load()).default;
}
