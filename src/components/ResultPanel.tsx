"use client";

import { useEffect, useState } from "react";
import { buildShareText, whatsappShareUrl } from "@/lib/share";
import { msUntilNextSastMidnight } from "@/lib/time";
import type { GuessEntry } from "@/lib/game/types";
import type { TrackCode } from "@/lib/engine/keyboard";

function Countdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msUntilNextSastMidnight());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return null;
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return (
    <p className="text-sm text-zinc-500">
      Next word in <span className="font-mono font-semibold">{h}:{m}:{s}</span>
    </p>
  );
}

export function ResultPanel({
  won,
  track,
  trackName,
  puzzleNumber,
  guesses,
  maxGuesses,
  streak,
}: {
  won: boolean;
  track: TrackCode;
  trackName: string;
  puzzleNumber: number;
  guesses: GuessEntry[];
  maxGuesses: number;
  streak: number;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = () =>
    buildShareText({
      trackName,
      puzzleNumber,
      guesses,
      solved: won,
      maxGuesses,
      streak,
      url: `${window.location.origin}/p/${track}`,
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-zinc-200 p-4 text-center dark:border-zinc-700">
      <p className="text-lg font-bold">
        {won
          ? `Sharp! ${guesses.length}/${maxGuesses} 🎉`
          : "So close — better luck tomorrow!"}
      </p>
      {won && streak > 0 && (
        <p className="text-sm text-zinc-500">🔥 {streak}-day streak</p>
      )}
      {won && (
        <p className="text-sm text-zinc-500">
          You&apos;re in today&apos;s R29 airtime draw — winners announced
          21:00.
        </p>
      )}
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(whatsappShareUrl(shareText()), "_blank");
          }}
          className="rounded bg-green-600 px-4 py-2 font-semibold text-white"
        >
          Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className="text-sm text-zinc-500 underline"
        >
          {copied ? "Copied!" : "Copy result"}
        </button>
      </div>
      <Countdown />
    </div>
  );
}
