"use client";

import { useState } from "react";
import { silhouettePath } from "@/lib/journey/silhouettes";
import type { ChapterTheme } from "@/lib/journey/types";

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
      {/* faint stars in the upper sky */}
      <svg
        className="absolute inset-x-0 top-0 h-1/3 w-full opacity-50"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        {[
          [7, 12],
          [16, 6],
          [28, 18],
          [41, 9],
          [55, 4],
          [67, 14],
          [80, 7],
          [91, 17],
          [96, 5],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.4 : 0.25} fill="#f7f3ea" />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: palette.accent }}
      />
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-[22%] left-0 h-[30%] w-full opacity-80"
      >
        <path d={silhouettePath(theme.id)} fill={palette.silhouette} />
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
