"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLiveTrack, LIVE_TRACKS } from "@/lib/tracks";
import { ArrowRightIcon, GiftIcon, HelpIcon } from "@/components/icons";

const HERO_TILES: { letter: string; cls: string }[] = [
  { letter: "s", cls: "tile-correct" },
  { letter: "h", cls: "tile-present" },
  { letter: "a", cls: "tile-absent" },
  { letter: "r", cls: "tile-correct" },
  { letter: "p", cls: "tile-correct" },
];

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Returning players go straight to their last track; new visitors land here.
  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem("mw:lastTrack");
    } catch {}
    if (last && isLiveTrack(last)) {
      router.replace(`/play/${last}`);
    } else {
      // Gate rendering until we know we're not redirecting (avoids a flash).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="animate-rise flex flex-1 flex-col items-center justify-center gap-8 pb-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="mx-auto grid w-64 grid-cols-5 gap-1.5">
          {HERO_TILES.map((t, i) => (
            <div
              key={i}
              className={`tile tile-reveal ${t.cls}`}
              style={{ "--col": i } as React.CSSProperties}
            >
              {t.letter}
            </div>
          ))}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Mzansi<span className="text-brand">Word</span>
        </h1>
        <p className="max-w-xs text-balance text-muted">
          One word a day, in your language. Solve it, brag on WhatsApp, and
          you&apos;re in the draw for airtime.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        {LIVE_TRACKS.map(({ code, name }, i) => (
          <Link
            key={code}
            href={`/play/${code}`}
            className={`flex cursor-pointer items-center justify-between rounded-2xl px-5 py-4 font-display text-lg font-semibold transition-transform active:scale-[0.98] ${
              i === 0
                ? "animate-glow bg-brand text-[#0b1210]"
                : "border border-edge bg-surface text-foreground hover:bg-raised"
            }`}
          >
            Play in {name}
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        ))}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gold/10 px-4 py-2.5 font-medium text-gold">
          <GiftIcon className="h-4 w-4 shrink-0" />
          Free forever · R29 airtime draw every night at 21:00
        </div>
        <Link
          href="/how-to-play"
          className="flex items-center justify-center gap-1.5 py-1 text-muted transition-colors hover:text-foreground"
        >
          <HelpIcon className="h-4 w-4" />
          How to play
        </Link>
      </div>
    </div>
  );
}
