"use client";

import { useEffect, useState } from "react";
import { buildShareText, whatsappShareUrl } from "@/lib/share";
import { msUntilNextSastMidnight } from "@/lib/time";
import { trackEvent } from "@/lib/track-event";
import type { GuessEntry } from "@/lib/game/types";
import type { Mark } from "@/lib/engine/score";
import type { TrackCode } from "@/lib/engine/keyboard";
import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  FlameIcon,
  GiftIcon,
  WhatsAppIcon,
} from "./icons";

const MINI_TILE: Record<Mark, string> = {
  0: "bg-[#2b3a33]",
  1: "bg-[#d9a514]",
  2: "bg-[#1fa14f]",
};

function MiniGrid({ guesses }: { guesses: GuessEntry[] }) {
  return (
    <div className="flex flex-col gap-1">
      {guesses.map((g, r) => (
        <div key={r} className="flex gap-1">
          {g.marks.map((m, c) => (
            <span key={c} className={`h-3.5 w-3.5 rounded-[3px] ${MINI_TILE[m]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

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
    <p className="flex items-center gap-1.5 text-sm text-muted">
      <ClockIcon className="h-4 w-4" />
      Next word in{" "}
      <span className="font-mono font-semibold text-foreground">
        {h}:{m}:{s}
      </span>
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
    <div className="animate-rise w-full rounded-2xl border border-edge bg-surface p-5 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-2xl font-bold leading-tight">
            {won ? (
              <>
                Got it in{" "}
                <span className="text-brand">
                  {guesses.length}/{maxGuesses}
                </span>
              </>
            ) : (
              "So close!"
            )}
          </h2>
          {won && streak > 0 && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gold">
              <FlameIcon className="h-4 w-4 animate-flame" />
              {streak}-day streak — keep it alive tomorrow
            </p>
          )}
          {!won && (
            <p className="text-sm text-muted">
              Tomorrow&apos;s word is waiting. Your streak needs you!
            </p>
          )}
        </div>
        <MiniGrid guesses={guesses} />
      </div>

      {won && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-brand/10 px-3.5 py-2.5 text-sm font-medium text-brand">
          <GiftIcon className="h-5 w-5 shrink-0" />
          You&apos;re in tonight&apos;s R29 airtime draw — winners at 21:00
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            trackEvent("share_click", track);
            window.open(whatsappShareUrl(shareText()), "_blank");
          }}
          className="animate-glow flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-3.5 font-display text-lg font-semibold text-[#0b1210] transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-6 w-6" />
          Challenge your chommies
        </a>
        <button
          type="button"
          onClick={copy}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-edge px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-raised hover:text-foreground"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 text-brand" /> Copied!
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" /> Copy result
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Countdown />
      </div>
    </div>
  );
}
