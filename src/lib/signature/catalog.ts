// The Signature Moments catalog (Game Design Bible §6.5).
//
// Design rules baked in here:
//  1. Every moment has a name and an emotion (a player can *say* it).
//  2. Rarity is tiered — spark (nice), gold (proud), legend (story you tell).
//     Legends are scarce on purpose; a moment that fires every session is
//     wallpaper, not a memory.
//  3. Unmistakably local — Ubuntu, provinces, SA wildlife/landmarks.
//  4. Cheap — every ACTIVE trigger reads data the game already tracks.
//
// "planned" entries capture the rest of the §6.5 vision (first-in-province,
// school #1, collection completion) but need leaderboards / word categories
// that don't exist yet, so they're excluded from detection until promoted.

import type { PlayerSnapshot, SignatureMoment } from "./types";
import { TIER_ORDER } from "./types";

export const MOMENTS: readonly SignatureMoment[] = [
  // ---- Onboarding delight (first-minute affection) ----
  {
    id: "first-daily",
    emoji: "🎉",
    title: "Your first solve",
    line: "Welcome to Mzansi Word. This is where it begins.",
    tier: "spark",
    status: "active",
    shareable: true,
    test: (s) => s.dailySolves >= 1,
  },
  {
    id: "first-words-25",
    emoji: "✨",
    title: "25 words discovered",
    line: "You're finding your rhythm.",
    tier: "spark",
    status: "active",
    shareable: false,
    test: (s) => s.wordsDiscovered >= 25,
  },

  // ---- Daily skill ----
  {
    id: "clutch-two",
    emoji: "⚡",
    title: "Solved in 2",
    line: "Yhu! Barely broke a sweat.",
    tier: "gold",
    status: "active",
    shareable: true,
    test: (s) => s.lastGuessCount !== null && s.lastGuessCount <= 2,
  },
  {
    id: "hole-in-one",
    emoji: "🎯",
    title: "Solved in 1",
    line: "First guess. Unreal. Tell someone.",
    tier: "legend",
    status: "active",
    shareable: true,
    test: (s) => s.lastGuessCount === 1,
  },

  // ---- Streak (loss-aversion payoff, named the SA way) ----
  {
    id: "streak-7",
    emoji: "🔥",
    title: "7-day streak",
    line: "A full week. The habit is yours now.",
    tier: "spark",
    status: "active",
    shareable: true,
    test: (s) => s.currentStreak >= 7,
  },
  {
    id: "streak-30",
    emoji: "🔥",
    title: "30-day streak",
    line: "A month of showing up. Serious form.",
    tier: "gold",
    status: "active",
    shareable: true,
    test: (s) => s.currentStreak >= 30,
  },
  {
    id: "streak-100",
    emoji: "🔥",
    title: "100-day Ubuntu streak",
    line: "One hundred days. You're built different.",
    tier: "legend",
    status: "active",
    shareable: true,
    test: (s) => s.currentStreak >= 100,
  },
  {
    id: "streak-365",
    emoji: "🇿🇦",
    title: "365 days — a full year",
    line: "A whole year of words. Legendary.",
    tier: "legend",
    status: "active",
    shareable: true,
    test: (s) => s.currentStreak >= 365,
  },

  // ---- Discovery / mastery (the educational proof points) ----
  {
    id: "words-100",
    emoji: "📖",
    title: "100 words discovered",
    line: "Your vocabulary is growing.",
    tier: "spark",
    status: "active",
    shareable: false,
    test: (s) => s.wordsDiscovered >= 100,
  },
  {
    id: "words-500",
    emoji: "📖",
    title: "500 words discovered",
    line: "Half a thousand. Impressive.",
    tier: "gold",
    status: "active",
    shareable: true,
    test: (s) => s.wordsDiscovered >= 500,
  },
  {
    id: "words-1000",
    emoji: "🇿🇦",
    title: "Your 1,000th South African word",
    line: "One thousand words. A milestone worth telling.",
    tier: "legend",
    status: "active",
    shareable: true,
    test: (s) => s.wordsDiscovered >= 1000,
  },

  // ---- Journey progression ----
  {
    id: "chapter-first",
    emoji: "🏔️",
    title: "First chapter complete",
    line: "One landmark down. The journey across Mzansi begins.",
    tier: "spark",
    status: "active",
    shareable: true,
    test: (s) => s.chaptersDone >= 1,
  },
  {
    id: "journey-50",
    emoji: "🗺️",
    title: "50 levels explored",
    line: "You're travelling the whole country, level by level.",
    tier: "gold",
    status: "active",
    shareable: true,
    test: (s) => s.journeyLevels >= 50,
  },

  // ---- Planned (need systems not yet built — Bible §6.5) ----
  {
    id: "province-first-today",
    emoji: "🏆",
    title: "First player in your province today",
    line: "You represented before anyone else.",
    tier: "gold",
    status: "planned",
    shareable: true,
    // needs per-province daily leaderboard (Phase 2/3)
  },
  {
    id: "school-number-one",
    emoji: "🎉",
    title: "Your school reached #1 this week",
    line: "You carried your school to the top.",
    tier: "legend",
    status: "planned",
    shareable: true,
    // needs clubs + school leaderboards (Phase 3)
  },
  {
    id: "collection-animals",
    emoji: "📖",
    title: "Discovered every animal word",
    line: "A complete collection. Beautiful.",
    tier: "gold",
    status: "planned",
    shareable: true,
    // needs word categorisation / collections (Phase 4 / Year 2)
  },
  {
    id: "grade-5-vocab",
    emoji: "🎓",
    title: "Completed the Grade 5 vocabulary collection",
    line: "Curriculum mastered. For the classroom and beyond.",
    tier: "legend",
    status: "planned",
    shareable: true,
    // needs curriculum-aligned content (Education platform, Year 2)
  },
] as const;

const BY_ID = new Map(MOMENTS.map((m) => [m.id, m]));

export function getMoment(id: string): SignatureMoment | undefined {
  return BY_ID.get(id);
}

/** Moments that can actually fire today (have a live trigger). */
export function activeMoments(): SignatureMoment[] {
  return MOMENTS.filter((m) => m.status === "active" && m.test);
}

/** Set of all valid moment ids — used server-side to clamp what can be recorded. */
export function knownMomentIds(): Set<string> {
  return new Set(MOMENTS.map((m) => m.id));
}

/** Ascending tier, so a batch shows spark → gold → legend (climax last). */
export function byTierAscending(
  a: SignatureMoment,
  b: SignatureMoment,
): number {
  return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
}
