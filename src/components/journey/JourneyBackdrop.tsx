"use client";

import { useEffect, useRef, useState } from "react";
import { silhouettePath } from "@/lib/journey/silhouettes";
import { useParallax } from "@/lib/useParallax";
import { ShaderSky } from "./ShaderSky";
import type { ChapterTheme } from "@/lib/journey/types";

const STARS: [number, number][] = [
  [7, 12],
  [16, 6],
  [28, 18],
  [41, 9],
  [55, 4],
  [67, 14],
  [80, 7],
  [91, 17],
  [96, 5],
];

/**
 * Chapter backdrop as a parallax 2.5D scene (GAME-FEEL.md #2): stars, sun
 * glow, far ridge, drop-in AI art, and near ridge each sit at a different
 * depth, driven by device tilt / pointer via useParallax. Layers are
 * overscaled so their edges never enter the frame at max shift. Stars
 * twinkle and the glow breathes (opacity-only keyframes) so the scene is
 * alive even with no sensor input. When /public/themes/<id>.webp exists it
 * fades in over the code-drawn scene with no code change needed.
 */
export function JourneyBackdrop({ theme }: { theme: ChapterTheme }) {
  const [imgReady, setImgReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useParallax(ref);
  const { palette } = theme;
  const path = silhouettePath(theme.id);

  // The art often finishes loading (from cache) before hydration attaches
  // onLoad, so the event alone can never fire — check the flag too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setImgReady(true);
  }, [theme.id]);

  const depth = (d: number): React.CSSProperties => ({
    transform: `translate3d(calc(var(--px, 0px) * ${-d}), calc(var(--py, 0px) * ${-d}), 0) scale(1.08)`,
    willChange: "transform",
  });

  return (
    <div ref={ref} className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyBottom} 55%, var(--background) 92%)`,
        }}
      />

      {/* living sky (GAME-FEEL.md #5): fades in over the gradient fallback;
          pauses once chapter art fully covers it */}
      <ShaderSky
        key={theme.id}
        skyTop={palette.skyTop}
        skyBottom={palette.skyBottom}
        accent={palette.accent}
        paused={imgReady}
      />

      {/* stars: two groups on staggered twinkle loops */}
      {[0, 1].map((group) => (
        <svg
          key={group}
          className="fx-twinkle absolute inset-x-0 top-0 h-1/3 w-full"
          style={{
            ...depth(0.12),
            animationDelay: group ? "2.1s" : "0s",
          }}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          {STARS.filter((_, i) => i % 2 === group).map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 2 === 0 ? 0.4 : 0.25}
              fill="#f7f3ea"
            />
          ))}
        </svg>
      ))}

      <div
        className="fx-breathe absolute top-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{
          left: "calc(50% - 8rem)",
          background: palette.accent,
          ...depth(0.25),
        }}
      />

      {/* far ridge: shifted, faded copy for depth */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-[26%] left-[-8%] h-[26%] w-[116%] opacity-40"
        style={depth(0.45)}
      >
        <path d={path} fill={palette.silhouette} />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={`/themes/${theme.id}.webp`}
        alt=""
        loading="lazy"
        onLoad={() => setImgReady(true)}
        onError={(e) => (e.currentTarget.style.display = "none")}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          imgReady ? "opacity-100" : "opacity-0"
        }`}
        style={depth(0.3)}
      />

      {/* near ridge rides above the drop-in art so depth survives it */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-[22%] left-0 h-[30%] w-full opacity-80"
        style={depth(0.8)}
      >
        <path d={path} fill={palette.silhouette} />
      </svg>

      {/* keep the play area legible over any art */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(18,15,23,0.82) 45%, rgba(18,15,23,0.96) 100%)",
        }}
      />
    </div>
  );
}
