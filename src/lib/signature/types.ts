// Signature Moments — engineered, shareable milestones that make players fall
// in love with MzansiWord (Game Design Bible §6.5). These are NOT the Journey
// "Mzansi Moments" vignettes (src/lib/journey/moments.ts); they are personal
// achievement moments: named, rare, unmistakably South African, and shareable.
//
// No prize or economy value is attached, so — like Journey — this system is
// client-authoritative, with an optional server mirror so moments persist
// across a logged-in player's devices. Nothing here may gate the first-minute
// experience (Bible §4).

export type MomentTier = "spark" | "gold" | "legend";

/** Everything a moment's trigger can read. All cumulative unless noted. */
export interface PlayerSnapshot {
  /** Current daily streak (from profiles.current_streak). */
  currentStreak: number;
  /** Best-ever daily streak. */
  bestStreak: number;
  /** Lifetime count of daily puzzles solved. */
  dailySolves: number;
  /** Guesses used on the daily that just finished (null if not a daily event). */
  lastGuessCount: number | null;
  /** Cumulative words discovered across all modes (grid + bonus + daily). */
  wordsDiscovered: number;
  /** Cumulative Journey levels completed across tracks. */
  journeyLevels: number;
  /** Cumulative Journey chapters completed across tracks. */
  chaptersDone: number;
}

export interface SignatureMoment {
  /** Stable id — persisted, so never renumber. */
  id: string;
  emoji: string;
  /** One-line, quotable title ("100-day Ubuntu streak"). */
  title: string;
  /** The emotion / subtitle shown under the title. */
  line: string;
  tier: MomentTier;
  /**
   * "active" moments fire today. "planned" ones document the full §6.5 vision
   * but need systems that don't exist yet (leaderboards, word categories) and
   * are excluded from detection until promoted to "active".
   */
  status: "active" | "planned";
  /** True if this milestone should generate a shareable WhatsApp card. */
  shareable: boolean;
  /** Pure trigger over a snapshot. Absent for "planned" moments. */
  test?: (s: PlayerSnapshot) => boolean;
}

export const TIER_ORDER: Record<MomentTier, number> = {
  spark: 0,
  gold: 1,
  legend: 2,
};
