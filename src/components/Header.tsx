"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LIVE_TRACKS } from "@/lib/tracks";
import { FlameIcon, HelpIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  const [streak, setStreak] = useState<number | null>(null);

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
    <header className="sticky top-0 z-40 border-b border-edge bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-3 py-2.5">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight"
        >
          Mzansi<span className="text-brand">Word</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          {streak !== null && (
            <Link
              href="/me"
              aria-label={`${streak}-day streak`}
              className="mr-0.5 flex items-center gap-1 rounded-full bg-raised px-2.5 py-1 text-sm font-bold text-gold"
            >
              <FlameIcon className="h-4 w-4 animate-flame" />
              {streak}
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
                    ? "bg-brand text-[#0b1210]"
                    : "text-muted hover:bg-raised hover:text-foreground"
                }`}
              >
                {name}
              </Link>
            );
          })}
          <Link
            href="/how-to-play"
            aria-label="How to play"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-foreground"
          >
            <HelpIcon className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
