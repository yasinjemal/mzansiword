import { silhouettePath } from "@/lib/journey/silhouettes";
import type { ChapterTheme } from "@/lib/journey/types";

/**
 * Mini panorama for chapter cards: dusk sky, glowing sun, and two layered
 * landscape silhouettes for depth. Purely decorative — parents position it
 * absolutely behind their content and provide their own legibility scrim.
 */
export function ChapterScene({ theme }: { theme: ChapterTheme }) {
  const { palette } = theme;
  const path = silhouettePath(theme.id);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyBottom} 100%)`,
        }}
      />
      <div
        className="absolute right-[16%] top-[12%] h-14 w-14 rounded-full"
        style={{
          background: `radial-gradient(circle at 38% 32%, #fff7e0 0%, ${palette.accent} 55%, transparent 72%)`,
          boxShadow: `0 0 30px 6px ${palette.accent}66`,
          opacity: 0.9,
        }}
      />
      {/* far ridge: shifted + faded for depth */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[-12%] h-[78%] w-[124%] opacity-40"
      >
        <path d={path} fill={palette.silhouette} />
      </svg>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-[58%] w-full"
      >
        <path d={path} fill={palette.silhouette} />
      </svg>
      {/* left-side scrim so card text stays legible over the scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
    </div>
  );
}
