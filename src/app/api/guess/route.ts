import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  getPlay,
  getProfile,
  getTodayPuzzle,
  isValidGuessWord,
} from "@/lib/game/db";
import { MAX_GUESSES, type GuessEntry } from "@/lib/game/types";
import { isSolved, score } from "@/lib/engine/score";
import { isLiveTrack } from "@/lib/tracks";
import { sastToday, sastYesterday } from "@/lib/time";
import { logEvent } from "@/lib/events";

const BodySchema = z.object({
  track: z.string(),
  guess: z
    .string()
    .min(4)
    .max(6)
    .transform((s) => s.toLowerCase())
    .pipe(z.string().regex(/^[a-z]+$/)),
});

// Solves faster than this are flagged and excluded from prize draws. A
// first-guess solve always lands here (started_at is set by that same
// guess), which is intended: think time can't be verified for it.
const FAST_SOLVE_MS = 10_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { track, guess } = parsed.data;
  if (!isLiveTrack(track)) {
    return NextResponse.json({ error: "unknown_track" }, { status: 404 });
  }

  const profile = await getProfile(user.id);
  if (!profile || profile.banned) {
    return NextResponse.json({ error: "banned" }, { status: 403 });
  }
  if (!profile.consent_popia_at) {
    return NextResponse.json({ error: "consent_required" }, { status: 403 });
  }

  const puzzle = await getTodayPuzzle(track);
  if (!puzzle) {
    return NextResponse.json({ error: "no_puzzle_today" }, { status: 404 });
  }
  if (guess.length !== puzzle.length) {
    return NextResponse.json({ error: "wrong_length" }, { status: 422 });
  }
  if (!(await isValidGuessWord(track, guess))) {
    return NextResponse.json({ error: "not_in_word_list" }, { status: 422 });
  }

  const play = await getPlay(user.id, puzzle.id);
  if (play && (play.solved || play.guess_count >= MAX_GUESSES)) {
    return NextResponse.json({ error: "already_finished" }, { status: 409 });
  }

  const marks = score(guess, puzzle.answer);
  const solved = isSolved(marks);
  const entry: GuessEntry = { word: guess, marks };
  const guessCount = (play?.guess_count ?? 0) + 1;
  const gameOver = solved || guessCount >= MAX_GUESSES;
  const now = new Date();
  const admin = adminClient();

  if (!play) {
    const { error } = await admin.from("plays").insert({
      user_id: user.id,
      puzzle_id: puzzle.id,
      guesses: [entry],
      guess_count: 1,
      solved,
      started_at: now.toISOString(),
      finished_at: gameOver ? now.toISOString() : null,
      solve_ms: solved ? 0 : null,
      flagged: solved,
      flag_reason: solved ? "fast_solve" : null,
    });
    if (error) {
      // 23505 = concurrent insert of the same play; treat as a double submit.
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json(
        { error: status === 409 ? "conflict" : "server_error" },
        { status },
      );
    }
  } else {
    const solveMs = solved
      ? now.getTime() - new Date(play.started_at).getTime()
      : null;
    const flagged = solved && solveMs !== null && solveMs < FAST_SOLVE_MS;
    const { data: updated, error } = await admin
      .from("plays")
      .update({
        guesses: [...play.guesses, entry],
        guess_count: guessCount,
        solved,
        finished_at: gameOver ? now.toISOString() : null,
        solve_ms: solveMs,
        ...(flagged ? { flagged: true, flag_reason: "fast_solve" } : {}),
      })
      .eq("id", play.id)
      .eq("guess_count", play.guess_count) // optimistic lock vs double submit
      .select("id");
    if (error) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
  }

  let streak = profile.current_streak;
  let shields = profile.streak_shields;
  let shieldUsed = false;
  if (solved) {
    const { data, error } = await admin.rpc("update_streak_on_solve", {
      p_user: user.id,
      p_today: sastToday(),
      p_yesterday: sastYesterday(),
    });
    if (!error && data && data.length > 0) {
      streak = data[0].current_streak;
      shields = data[0].shields_remaining;
      shieldUsed = data[0].shield_used;
      // A shield auto-saved a lapsing streak — log it distinctly so shield-users'
      // retention can be watched separately (RFC-0002 guardrail, TELEMETRY.md).
      if (shieldUsed) {
        await logEvent("streak_shield_used", {
          userId: user.id,
          track,
          props: { mode: "daily", streak, shields_remaining: shields },
        });
      }
    }
  }

  return NextResponse.json({ marks, solved, gameOver, streak, shields, shieldUsed });
}
