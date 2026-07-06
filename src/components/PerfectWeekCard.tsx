"use client";

import { useEffect } from "react";
import { fireConfetti, vibrate } from "@/lib/celebrate";
import { sfx } from "@/lib/sound";
import { whatsappShareUrl } from "@/lib/share";
import { trackEvent } from "@/lib/track-event";
import { weeksInStreak } from "@/lib/streak/perfect-week";
import { TrophyIcon, WhatsAppIcon } from "./icons";

/**
 * Perfect Week gold pride state (RFC-0003) — a repeating, no-reward celebration
 * for reaching a whole-week streak multiple past the first week. Decorative and
 * dismissible; never blocks play. Reduced motion is honoured via the shared
 * `celebrate` helpers (confetti + haptic both no-op under prefers-reduced-motion).
 */
export function PerfectWeekCard({
  streak,
  onDone,
}: {
  streak: number;
  onDone?: () => void;
}) {
  const weeks = weeksInStreak(streak);

  useEffect(() => {
    trackEvent("perfect_week", undefined, { streak, weeks });
    vibrate([12, 40, 12]);
    sfx.complete();
    void fireConfetti(true);
  }, [streak, weeks]);

  const share = () => {
    const url = `${window.location.origin}/`;
    const text = `🏆 ${weeks} weeks straight on Mzansi Word — ${streak}-day streak and counting! Play the free daily word game: ${url}`;
    window.open(whatsappShareUrl(text), "_blank");
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={`Perfect Week. ${weeks} weeks straight — a ${streak}-day streak.`}
      className="animate-rise fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-6 backdrop-blur-sm"
      onClick={() => onDone?.()}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-edge bg-surface p-7 text-center shadow-2xl shadow-black/50 ring-2 ring-gold"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Perfect Week
        </p>
        <div className="my-3 flex justify-center" aria-hidden>
          <TrophyIcon className="h-16 w-16 text-gold" />
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
          {weeks} weeks straight!
        </h2>
        <p className="mt-2 text-sm text-muted">
          You showed up every day — a {streak}-day streak. Sharp!
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={share}
            className="press-spring flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-3 font-display text-base font-semibold text-ink"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Share the flex
          </button>
          <button
            type="button"
            onClick={() => onDone?.()}
            className="rounded-xl border border-edge px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-raised hover:text-foreground"
          >
            Sharp!
          </button>
        </div>
      </div>
    </div>
  );
}
