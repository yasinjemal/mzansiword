// Per-chapter landscape silhouette profiles (viewBox 0 0 100 40,
// bottom-anchored). Shared by the full-screen JourneyBackdrop and the
// mini panorama scenes on the map/landing cards. Keyed by ChapterTheme id.

export const SILHOUETTES: Record<string, string> = {
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

export function silhouettePath(id: string): string {
  return SILHOUETTES[id] ?? SILHOUETTES["drakensberg"];
}
