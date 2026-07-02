import { NextResponse } from "next/server";
import { getTodayPuzzle } from "@/lib/game/db";
import { isLiveTrack } from "@/lib/tracks";
import { msUntilNextSastMidnight, puzzleNumber } from "@/lib/time";

// Public. Today's puzzle metadata only — never the answer, never
// date-addressable.
export async function GET(request: Request) {
  const track = new URL(request.url).searchParams.get("track") ?? "";
  if (!isLiveTrack(track)) {
    return NextResponse.json({ error: "unknown_track" }, { status: 404 });
  }

  const puzzle = await getTodayPuzzle(track);
  if (!puzzle) {
    return NextResponse.json({ error: "no_puzzle_today" }, { status: 404 });
  }

  const maxAge = Math.max(1, Math.floor(msUntilNextSastMidnight() / 1000));
  return NextResponse.json(
    {
      track,
      puzzleDate: puzzle.puzzle_date,
      puzzleNumber: puzzleNumber(puzzle.puzzle_date),
      length: puzzle.length,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${maxAge}, max-age=0`,
      },
    },
  );
}
