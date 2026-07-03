export type Dir = "h" | "v";

export interface PlacedWord {
  word: string;
  x: number; // top-left cell of the word
  y: number;
  dir: Dir;
}

/**
 * One playable level. Ships to the client whole — including bonus words —
 * because Journey is client-authoritative by design (no prizes attached).
 */
export interface JourneyLevel {
  id: string; // "<track>-<chapter>-<levelInChapter>", e.g. "en-2-7"
  wheel: string[]; // letters on the wheel, pre-shuffled deterministically
  words: PlacedWord[]; // crossword grid words
  gridW: number;
  gridH: number;
  bonus: string[]; // valid words formable from the wheel, not in the grid
}

export interface ChapterManifestEntry {
  index: number; // 1-based
  levelCount: number;
}

export interface JourneyManifest {
  tracks: Record<
    string,
    { chapters: ChapterManifestEntry[]; totalLevels: number }
  >;
}

export interface SponsorInfo {
  name: string;
  tagline: string;
  logoUrl?: string; // under /public/sponsors/
}

export interface ChapterTheme {
  id: string; // matches /public/themes/<id>.webp drop-in
  name: string;
  blurb: string;
  palette: {
    skyTop: string;
    skyBottom: string;
    silhouette: string;
    accent: string;
  };
  sponsor?: SponsorInfo;
}
