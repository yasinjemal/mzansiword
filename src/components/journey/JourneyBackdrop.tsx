"use client";

import { useState } from "react";
import type { ChapterTheme } from "@/lib/journey/types";

// Per-chapter silhouette profiles (viewBox 0 0 100 40, bottom-anchored).
const SILHOUETTES: Record<string, string> = {
  "table-mountain":
    "M0 40 L0 26 L14 24 L22 12 L30 10 L58 10 L64 12 L74 22 L86 26 L100 28 L100 40 Z",
  "wild-coast":
    "M0 40 L0 24 Q12 18 22 22 Q34 27 44 21 Q56 14 68 20 Q82 27 100 22 L100 40 Z",
  drakensberg:
    "M0 40 L0 28 L10 16 L18 24 L28 8 L38 20 L48 6 L58 18 L68 10 L78 22 L88 14 L100 26 L100 40 Z",
  kruger:
    "M0 40 L0 30 L100 30 L100 40 Z M20 30 L20 22 Q22 18 28 17 Q26 20 27 22 Q33 20 36 23 Q30 24 28 26 L26 30 Z",
  joburg:
    "M0 40 L0 30 L8 30 L8 20 L14 20 L14 26 L22 26 L22 12 L28 12 L28 26 L36 26 L36 18 L44 18 L44 28 L52 28 L52 8 L56 6 L60 8 L60 28 L70 28 L70 16 L78 16 L78 24 L86 24 L86 28 L100 28 L100 40 Z",
};

/**
 * Chapter backdrop: always renders a code-drawn gradient + silhouette from
 * the palette; when /public/themes/<id>.webp exists (AI art drop-in), it
 * fades in on top with no code change needed.
 */
export function JourneyBackdrop({ theme }: { theme: ChapterTheme }) {
  const [imgReady, setImgReady] = useState(false);
  const { palette } = theme;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyBottom} 55%, var(--background) 92%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: palette.accent }}
      />
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-[22%] left-0 h-[30%] w-full opacity-80"
      >
        <path d={SILHOUETTES[theme.id] ?? SILHOUETTES["drakensberg"]} fill={palette.silhouette} />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/themes/${theme.id}.webp`}
        alt=""
        loading="lazy"
        onLoad={() => setImgReady(true)}
        onError={(e) => (e.currentTarget.style.display = "none")}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          imgReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* keep the play area legible over any art */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(11,18,16,0.82) 45%, rgba(11,18,16,0.96) 100%)",
        }}
      />
    </div>
  );
}
