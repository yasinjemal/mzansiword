"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LIVE_TRACKS } from "@/lib/tracks";
import { isMuted, setMuted } from "@/lib/sound";
import { FlameIcon, HelpIcon, MapIcon, SpeakerIcon, SpeakerOffIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  const [streak, setStreak] = useState<number | null>(null);
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMutedState(isMuted());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!cancelled && me && me.currentStreak > 0) {
          setStreak(me.currentStreak);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-3 py-2.5">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight"
        >
          Mzansi<span className="text-gold-grad">Word</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          {streak !== null && (
            <Link
              href="/me"
              aria-label={`${streak}-day streak`}
              className="coin-chip mr-0.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold"
            >
              <FlameIcon className="h-4 w-4 animate-flame text-terracotta" />
              {streak}
              <span className="text-[0.6rem] font-extrabold uppercase tracking-wide opacity-80">
                day{streak === 1 ? "" : "s"}
              </span>
            </Link>
          )}
          {LIVE_TRACKS.map(({ code, name }) => {
            const active = pathname === `/play/${code}`;
            return (
              <Link
                key={code}
                href={`/play/${code}`}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "btn-primary"
                    : "text-muted hover:bg-raised hover:text-foreground"
                }`}
              >
                {name}
              </Link>
            );
          })}
          <Link
            href="/journey"
            aria-label="Journey"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-raised hover:text-foreground ${
              pathname.startsWith("/journey") ? "text-brand" : "text-muted"
            }`}
          >
            <MapIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setMutedState(next);
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-foreground"
          >
            {muted ? (
              <SpeakerOffIcon className="h-4.5 w-4.5" />
            ) : (
              <SpeakerIcon className="h-4.5 w-4.5" />
            )}
          </button>
          <Link
            href="/how-to-play"
            aria-label="How to play"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-foreground"
          >
            <HelpIcon className="h-5 w-5" />
          </Link>
        </nav>
      </div>
      <div className="hairline-trim" />
    </header>
  );
}
