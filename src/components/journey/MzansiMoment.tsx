"use client";

import { useEffect, useRef, useState } from "react";
import { silhouettePath } from "@/lib/journey/silhouettes";
import { springEnter } from "@/lib/spring";
import { sfx } from "@/lib/sound";
import type { Moment } from "@/lib/journey/moments";

/**
 * Mzansi Moment interstitial (GAME-FEEL.md A7): a full-screen landmark
 * vignette with a fun fact between levels — a breather that makes chapter
 * progress feel like traveling across South Africa. Tap anywhere to continue.
 * Optional art drop-in: /public/themes/moment-<id>.webp fades in over the
 * code-drawn scene.
 */
export function MzansiMoment({
  moment,
  onDismiss,
}: {
  moment: Moment;
  onDismiss: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgReady, setImgReady] = useState(false);
  const { palette } = moment;
  const path = silhouettePath(moment.silhouette);

  useEffect(() => {
    sfx.bonus();
    if (cardRef.current) springEnter(cardRef.current, 26);
  }, []);

  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label={`${moment.title} — tap to continue`}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-end overflow-hidden text-left"
    >
      {/* scene */}
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyBottom} 70%, var(--background) 100%)`,
          }}
        />
        <div
          className="absolute top-[22%] h-32 w-32 rounded-full"
          style={{
            left: "calc(50% - 4rem)",
            background: `radial-gradient(circle at 40% 35%, #fff7e0 0%, ${palette.accent} 55%, transparent 74%)`,
            boxShadow: `0 0 60px 16px ${palette.accent}55`,
          }}
        />
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute bottom-[30%] left-[-10%] h-[26%] w-[120%] opacity-45"
        >
          <path d={path} fill={palette.silhouette} />
        </svg>
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute bottom-[24%] left-0 h-[32%] w-full"
        >
          <path d={path} fill={palette.silhouette} />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/themes/moment-${moment.id}.webp`}
          alt=""
          onLoad={() => setImgReady(true)}
          onError={(e) => (e.currentTarget.style.display = "none")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            imgReady ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(18,15,23,0.85) 55%, rgba(18,15,23,0.98) 100%)",
          }}
        />
        <div className="pattern-band absolute inset-x-0 top-0" />
      </div>

      {/* copy card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-6 pb-14 text-center">
        <p
          className="text-xs font-extrabold uppercase tracking-[0.2em]"
          style={{ color: palette.accent }}
        >
          Mzansi Moment
        </p>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          {moment.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-balance text-sm leading-relaxed text-foreground/85">
          {moment.fact}
        </p>
        <p className="mt-6 animate-pulse text-xs font-semibold uppercase tracking-widest text-muted">
          Tap to continue
        </p>
      </div>
    </button>
  );
}
