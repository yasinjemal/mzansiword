"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LIVE_TRACKS } from "@/lib/tracks";

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-md items-center justify-between px-3 py-2">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Mzansi<span className="text-green-600">Word</span> 🇿🇦
        </Link>
        <nav className="flex items-center gap-1">
          {LIVE_TRACKS.map(({ code, name }) => {
            const active = pathname === `/play/${code}`;
            return (
              <Link
                key={code}
                href={`/play/${code}`}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {name}
              </Link>
            );
          })}
          <Link
            href="/how-to-play"
            aria-label="How to play"
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-sm font-bold text-zinc-500 dark:border-zinc-600 dark:text-zinc-300"
          >
            ?
          </Link>
        </nav>
      </div>
    </header>
  );
}
