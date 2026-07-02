import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlay, getTodayPuzzle, toPlayStateDto } from "@/lib/game/db";
import { isLiveTrack } from "@/lib/tracks";

// My play for today's puzzle in a track — hydrates the board on reload.
export async function GET(request: Request) {
  const track = new URL(request.url).searchParams.get("track") ?? "";
  if (!isLiveTrack(track)) {
    return NextResponse.json({ error: "unknown_track" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const puzzle = await getTodayPuzzle(track);
  if (!puzzle) {
    return NextResponse.json({ error: "no_puzzle_today" }, { status: 404 });
  }

  const play = await getPlay(user.id, puzzle.id);
  return NextResponse.json(toPlayStateDto(puzzle, play));
}
