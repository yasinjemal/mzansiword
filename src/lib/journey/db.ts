import "server-only";

// Server-side Journey ledger helpers (service role). Gameplay itself is
// client-authoritative; these only keep coins/progress trustworthy enough
// for future social surfaces.

import { adminClient } from "../supabase/admin";
import { STARTING_COINS } from "./economy";

export interface JourneyProgressRow {
  track_code: string;
  levels_completed: number;
  bonus_words_found: number;
  hints_used: number;
  imported_at: string | null;
}

export async function getJourneyProgress(
  userId: string,
): Promise<JourneyProgressRow[]> {
  const { data, error } = await adminClient()
    .from("journey_progress")
    .select("track_code, levels_completed, bonus_words_found, hints_used, imported_at")
    .eq("user_id", userId);
  if (error) throw new Error(`getJourneyProgress: ${error.message}`);
  return data ?? [];
}

export async function getWalletCoins(userId: string): Promise<number | null> {
  const { data, error } = await adminClient()
    .from("journey_wallets")
    .select("coins, lifetime_coins")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`getWalletCoins: ${error.message}`);
  return data?.coins ?? null;
}

/** Create the wallet with the newcomer grant if it doesn't exist yet. */
export async function ensureWallet(userId: string): Promise<void> {
  const { error } = await adminClient()
    .from("journey_wallets")
    .upsert(
      {
        user_id: userId,
        coins: STARTING_COINS,
        lifetime_coins: STARTING_COINS,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`ensureWallet: ${error.message}`);
}
