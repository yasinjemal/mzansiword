// Journey coin economy. Coins are FREE-EARNED ONLY — never purchasable.
// Adding any purchase path would turn the prize draws into paid-entry
// gambling under the CPA and destroy the promotional-competition framing.

export const LEVEL_REWARD = 20;
export const BONUS_WORD_REWARD = 5;
export const CHAPTER_REWARD = 50;
export const HINT_COST = 25; // reveal a random unrevealed cell
export const TARGET_HINT_COST = 50; // reveal a cell the player picks
export const STARTING_COINS = 50; // one friendly hint's worth for newcomers

/**
 * Upper bound on coins a player could legitimately hold, used to clamp the
 * guest-progress import. Deliberately generous (assumes every bonus word
 * found, nothing ever spent).
 */
export function maxEarnable(
  levelsCompleted: number,
  bonusFound: number,
  chaptersCompleted: number,
): number {
  return (
    STARTING_COINS +
    levelsCompleted * LEVEL_REWARD +
    bonusFound * BONUS_WORD_REWARD +
    chaptersCompleted * CHAPTER_REWARD
  );
}
