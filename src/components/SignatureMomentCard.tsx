"use client";

import { useEffect, useState } from "react";
import { fireConfetti, vibrate } from "@/lib/celebrate";
import { sfx } from "@/lib/sound";
import { whatsappShareUrl } from "@/lib/share";
import { buildMomentShareText } from "@/lib/signature/share";
import { trackEvent } from "@/lib/track-event";
import type { SignatureMoment } from "@/lib/signature/types";
import { WhatsAppIcon } from "./icons";

const TIER_RING: Record<SignatureMoment["tier"], string> = {
  spark: "ring-edge",
  gold: "ring-gold",
  legend: "ring-brand",
};

const TIER_LABEL: Record<SignatureMoment["tier"], string> = {
  spark: "Moment",
  gold: "Rare moment",
  legend: "Legendary moment",
};

/**
 * Plays a queue of earned Signature Moments, one full-screen card at a time.
 * Decorative and dismissible — it never blocks gameplay, and honours reduced
 * motion via the shared celebrate helpers.
 */
export function SignatureMomentCard({
  moments,
  onDone,
}: {
  moments: SignatureMoment[];
  onDone?: () => void;
}) {
  const [i, setI] = useState(0);
  const moment = moments[i];

  useEffect(() => {
    if (!moment) return;
    trackEvent("signature_moment", undefined, {
      id: moment.id,
      tier: moment.tier,
    });
    if (moment.tier === "legend") {
      vibrate([15, 60, 15, 60, 30]);
      sfx.complete();
      void fireConfetti(true);
    } else {
      vibrate(moment.tier === "gold" ? [12, 40, 12] : 12);
      sfx.bonus?.();
      void fireConfetti(false);
    }
  }, [moment]);

  if (!moment) return null;

  const next = () => {
    if (i + 1 < moments.length) setI(i + 1);
    else onDone?.();
  };

  const share = () => {
    const url = `${window.location.origin}/`;
    trackEvent("signature_share", undefined, { id: moment.id });
    window.open(whatsappShareUrl(buildMomentShareText(moment, url)), "_blank");
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={`${moment.title}. ${moment.line}`}
      className="animate-rise fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-6 backdrop-blur-sm"
      onClick={next}
    >
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-edge bg-surface p-7 text-center shadow-2xl shadow-black/50 ring-2 ${TIER_RING[moment.tier]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          {TIER_LABEL[moment.tier]}
        </p>
        <div className="my-3 text-6xl leading-none" aria-hidden>
          {moment.emoji}
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
          {moment.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{moment.line}</p>

        <div className="mt-6 flex flex-col gap-2">
          {moment.shareable && (
            <button
              type="button"
              onClick={share}
              className="press-spring flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-3 font-display text-base font-semibold text-ink"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Share this moment
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="rounded-xl border border-edge px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-raised hover:text-foreground"
          >
            {i + 1 < moments.length ? "Next" : "Sharp!"}
          </button>
        </div>

        {moments.length > 1 && (
          <p className="mt-3 text-xs text-muted">
            {i + 1} of {moments.length}
          </p>
        )}
      </div>
    </div>
  );
}
