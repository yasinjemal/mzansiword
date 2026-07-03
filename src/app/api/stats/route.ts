import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { MAX_GUESSES } from "@/lib/game/types";

interface TrackStats {
  played: number;
  won: number;
  winPct: number;
  /** Index 0 = losses, 1–6 = solved in N guesses. */
  distribution: number[];
}

export interface StatsResponse {
  totals: TrackStats & { currentStreak: number; bestStreak: number };
  tracks: Record<string, TrackStats>;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Fetch all finished plays for this user, joined with puzzle track_code.
  const { data: plays, error } = await adminClient()
    .from("plays")
    .select("guess_count, solved, puzzles!inner(track_code)")
    .eq("user_id", user.id)
    .not("finished_at", "is", null);

  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Aggregate totals and per-track stats.
  const emptyDist = () => new Array(MAX_GUESSES + 1).fill(0); // [0]=losses, [1..6]=guesses
  const trackMap: Record<string, { played: number; won: number; dist: number[] }> = {};
  const totalDist = emptyDist();
  let totalPlayed = 0;
  let totalWon = 0;

  for (const play of plays ?? []) {
    // The join returns puzzles as an object (inner join, single row).
    const track = (play.puzzles as unknown as { track_code: string }).track_code;
    if (!trackMap[track]) {
      trackMap[track] = { played: 0, won: 0, dist: emptyDist() };
    }
    const t = trackMap[track];
    t.played++;
    totalPlayed++;

    if (play.solved) {
      t.won++;
      totalWon++;
      const bucket = Math.min(play.guess_count, MAX_GUESSES);
      t.dist[bucket]++;
      totalDist[bucket]++;
    } else {
      t.dist[0]++;
      totalDist[0]++;
    }
  }

  // Fetch streak from the profile.
  const { data: profile } = await adminClient()
    .from("profiles")
    .select("current_streak, best_streak")
    .eq("id", user.id)
    .single();

  const pct = (won: number, played: number) =>
    played > 0 ? Math.round((won / played) * 100) : 0;

  const toTrackStats = (t: { played: number; won: number; dist: number[] }): TrackStats => ({
    played: t.played,
    won: t.won,
    winPct: pct(t.won, t.played),
    distribution: t.dist,
  });

  const tracks: Record<string, TrackStats> = {};
  for (const [code, t] of Object.entries(trackMap)) {
    tracks[code] = toTrackStats(t);
  }

  const response: StatsResponse = {
    totals: {
      played: totalPlayed,
      won: totalWon,
      winPct: pct(totalWon, totalPlayed),
      currentStreak: profile?.current_streak ?? 0,
      bestStreak: profile?.best_streak ?? 0,
      distribution: totalDist,
    },
    tracks,
  };

  return NextResponse.json(response);
}
