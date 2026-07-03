// Guest-side Journey persistence (localStorage). Logged-in users get the
// same shape mirrored to Supabase; the server copy wins on conflict and
// local data is imported once (clamped server-side) after first login.

import { STARTING_COINS } from "./economy";

export interface TrackLocalProgress {
  levelsCompleted: number; // next playable global level = this + 1
  bonusFound: number;
  chaptersCompleted: number;
  hintsUsed: number;
}

export interface JourneyLocal {
  coins: number;
  lifetimeCoins: number;
  tracks: Record<string, TrackLocalProgress>;
  importedToServer: boolean;
}

const KEY = "mw:journey:v1";

export function emptyTrackProgress(): TrackLocalProgress {
  return { levelsCompleted: 0, bonusFound: 0, chaptersCompleted: 0, hintsUsed: 0 };
}

export function defaultLocal(): JourneyLocal {
  return {
    coins: STARTING_COINS,
    lifetimeCoins: STARTING_COINS,
    tracks: {},
    importedToServer: false,
  };
}

export function loadLocal(): JourneyLocal {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultLocal();
    const parsed = JSON.parse(raw) as Partial<JourneyLocal>;
    return {
      ...defaultLocal(),
      ...parsed,
      tracks: parsed.tracks ?? {},
    };
  } catch {
    return defaultLocal();
  }
}

export function saveLocal(data: JourneyLocal): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function trackProgress(
  data: JourneyLocal,
  track: string,
): TrackLocalProgress {
  return data.tracks[track] ?? emptyTrackProgress();
}

interface MeResponse {
  progress: Record<string, { levelsCompleted: number; bonusWordsFound: number }>;
  coins: number | null;
}

/**
 * Reconcile localStorage with the server ledger. Guest (401): local as-is.
 * First login with local progress and a fresh server: one-shot import.
 * Otherwise the server wins for levels and coins. Returns the effective
 * local state after reconciliation.
 */
export async function syncWithServer(): Promise<JourneyLocal> {
  const local = loadLocal();
  try {
    const res = await fetch("/api/journey/me");
    if (!res.ok) return local; // guest or transient error
    const me: MeResponse = await res.json();

    const serverHasProgress =
      Object.values(me.progress).some((p) => p.levelsCompleted > 0) ||
      (me.coins ?? 0) > 0;
    const localHasProgress = Object.values(local.tracks).some(
      (t) => t.levelsCompleted > 0,
    );

    if (!serverHasProgress && localHasProgress && !local.importedToServer) {
      const imp = await fetch("/api/journey/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracks: Object.fromEntries(
            Object.entries(local.tracks).map(([k, t]) => [
              k,
              {
                levelsCompleted: t.levelsCompleted,
                bonusFound: t.bonusFound,
                hintsUsed: t.hintsUsed,
              },
            ]),
          ),
          coins: local.coins,
        }),
      });
      if (imp.ok) {
        const { coins } = await imp.json();
        local.importedToServer = true;
        if (typeof coins === "number") local.coins = coins;
        saveLocal(local);
      }
      return local;
    }

    // server wins
    for (const [track, p] of Object.entries(me.progress)) {
      const t = local.tracks[track] ?? emptyTrackProgress();
      if (p.levelsCompleted > t.levelsCompleted) {
        local.tracks[track] = {
          ...t,
          levelsCompleted: p.levelsCompleted,
          bonusFound: p.bonusWordsFound,
        };
      }
    }
    if (me.coins !== null) local.coins = me.coins;
    local.importedToServer = true;
    saveLocal(local);
    return local;
  } catch {
    return local;
  }
}
