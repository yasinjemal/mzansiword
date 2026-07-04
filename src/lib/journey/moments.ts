// Mzansi Moments (GAME-FEEL.md A7): every 5th completed level, a full-screen
// South African vignette — landmark + one-line fun fact — turns progressing
// through chapters into traveling across the country. Scenes are code-drawn
// (palette + silhouette id); dropping a 750×1600 WebP at
// /public/themes/moment-<id>.webp upgrades one to real art, same as chapters.

export interface Moment {
  id: string;
  /** silhouette key in lib/journey/silhouettes.ts */
  silhouette: string;
  title: string;
  fact: string;
  palette: {
    skyTop: string;
    skyBottom: string;
    silhouette: string;
    accent: string;
  };
}

export const MOMENTS: Moment[] = [
  {
    id: "table-mountain",
    silhouette: "table-mountain",
    title: "Table Mountain",
    fact: "Table Mountain is one of the oldest mountains on Earth — over 600 million years old.",
    palette: { skyTop: "#16283a", skyBottom: "#4a3050", silhouette: "#0c1520", accent: "#f0a05a" },
  },
  {
    id: "wild-coast",
    silhouette: "wild-coast",
    title: "The Wild Coast",
    fact: "The waves of the Wild Coast carved Hole in the Wall straight through a solid cliff.",
    palette: { skyTop: "#0e2733", skyBottom: "#14554f", silhouette: "#081a17", accent: "#34d399" },
  },
  {
    id: "karoo",
    silhouette: "karoo",
    title: "The Great Karoo",
    fact: "The Karoo covers nearly a third of South Africa — its name comes from a Khoikhoi word for 'land of thirst'.",
    palette: { skyTop: "#2a1a30", skyBottom: "#8a4a24", silhouette: "#1c0f0a", accent: "#ffb612" },
  },
  {
    id: "namaqualand",
    silhouette: "namaqualand",
    title: "Namaqualand",
    fact: "Every spring, Namaqualand's dry plains erupt into fields of millions of wildflowers.",
    palette: { skyTop: "#1c2340", skyBottom: "#b05a2c", silhouette: "#241110", accent: "#ff8a5c" },
  },
  {
    id: "kruger",
    silhouette: "kruger",
    title: "Kruger National Park",
    fact: "Kruger is nearly the size of a small country — and home to all of the Big Five.",
    palette: { skyTop: "#33150e", skyBottom: "#7a3b14", silhouette: "#1d0c06", accent: "#fbbf24" },
  },
  {
    id: "drakensberg",
    silhouette: "drakensberg",
    title: "The Drakensberg",
    fact: "uKhahlamba, the 'barrier of spears', shelters thousands of ancient San rock paintings.",
    palette: { skyTop: "#221f3a", skyBottom: "#3a2f55", silhouette: "#141127", accent: "#a78bfa" },
  },
  {
    id: "soweto",
    silhouette: "soweto",
    title: "Soweto",
    fact: "Vilakazi Street in Soweto is the only street in the world that housed two Nobel Peace Prize winners.",
    palette: { skyTop: "#1a1430", skyBottom: "#63321f", silhouette: "#160d14", accent: "#62c6ff" },
  },
  {
    id: "joburg",
    silhouette: "joburg",
    title: "Johannesburg",
    fact: "Joburg is one of the world's biggest cities not built on a river or coast — it grew from gold.",
    palette: { skyTop: "#101322", skyBottom: "#2b2440", silhouette: "#0a0c16", accent: "#ffd166" },
  },
];

export const MOMENT_EVERY = 5; // show after every Nth completed global level

/** The moment to show after completing `globalLevel`, or null. */
export function momentForLevel(globalLevel: number): Moment | null {
  if (globalLevel <= 0 || globalLevel % MOMENT_EVERY !== 0) return null;
  return MOMENTS[(globalLevel / MOMENT_EVERY - 1) % MOMENTS.length];
}
