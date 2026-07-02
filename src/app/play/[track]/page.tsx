import Link from "next/link";
import { notFound } from "next/navigation";
import { Game } from "@/components/Game";
import { createClient } from "@/lib/supabase/server";
import {
  getPendingPrizes,
  getPlay,
  getProfile,
  getTodayPuzzle,
  toPlayStateDto,
} from "@/lib/game/db";
import { MAX_GUESSES } from "@/lib/game/types";
import { isLiveTrack, TRACK_NAMES } from "@/lib/tracks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const name = TRACK_NAMES[track] ?? "SA";
  const title = `Mzansi Word — today's ${name} word`;
  const description =
    "Free daily word game in South Africa's languages. Solve today's word and you're in the draw for R29 airtime.";
  return {
    title,
    description,
    openGraph: { title, description, siteName: "Mzansi Word" },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!isLiveTrack(track)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const puzzle = await getTodayPuzzle(track);
  if (!puzzle) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-xl font-bold">No puzzle today 😅</p>
        <p className="text-sm text-zinc-500">
          The {TRACK_NAMES[track]} puzzle isn&apos;t scheduled yet — check back
          soon.
        </p>
      </div>
    );
  }

  let initialPlay = null;
  let streak = 0;
  let pendingPrize = null;
  if (user) {
    const [play, profile, pending] = await Promise.all([
      getPlay(user.id, puzzle.id),
      getProfile(user.id),
      getPendingPrizes(user.id),
    ]);
    initialPlay = play ? toPlayStateDto(puzzle, play) : null;
    streak = profile?.current_streak ?? 0;
    pendingPrize = pending[0] ?? null;
  }

  return (
    <>
      {pendingPrize && (
        <Link
          href={`/claim/${pendingPrize.id}`}
          className="mb-3 block rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white"
        >
          🎉 You won R{(pendingPrize.amount_cents / 100).toFixed(0)} airtime —
          tap to claim!
        </Link>
      )}
      <Game
        track={track}
        trackName={TRACK_NAMES[track]}
        length={puzzle.length}
        puzzleNumber={toPlayStateDto(puzzle, null).puzzleNumber}
        maxGuesses={MAX_GUESSES}
        initialPlay={initialPlay}
        authed={user !== null}
        initialStreak={streak}
      />
    </>
  );
}
