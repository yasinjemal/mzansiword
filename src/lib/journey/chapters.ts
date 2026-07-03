// Chapter themes: SA landmarks, in journey order. The `id` doubles as the
// backdrop drop-in name — put an AI-generated 750×1600 WebP at
// /public/themes/<id>.webp and it automatically replaces the code-drawn
// gradient fallback (see JourneyBackdrop). Sponsored chapters set `sponsor`.

import type { ChapterTheme } from "./types";

export const CHAPTER_THEMES: ChapterTheme[] = [
  {
    id: "table-mountain",
    name: "Table Mountain Dawn",
    blurb: "Start where the mountain meets the sea.",
    palette: {
      skyTop: "#16283a",
      skyBottom: "#4a3050",
      silhouette: "#0c1520",
      accent: "#f0a05a",
    },
  },
  {
    id: "wild-coast",
    name: "Wild Coast",
    blurb: "Green hills, rolling waves — eKapa to Qunu.",
    palette: {
      skyTop: "#0e2733",
      skyBottom: "#14554f",
      silhouette: "#081a17",
      accent: "#34d399",
    },
  },
  {
    id: "drakensberg",
    name: "Drakensberg Heights",
    blurb: "The dragon mountains test sharper minds.",
    palette: {
      skyTop: "#221f3a",
      skyBottom: "#3a2f55",
      silhouette: "#141127",
      accent: "#a78bfa",
    },
  },
  {
    id: "kruger",
    name: "Kruger Sunset",
    blurb: "Golden dusk in the bushveld.",
    palette: {
      skyTop: "#33150e",
      skyBottom: "#7a3b14",
      silhouette: "#1d0c06",
      accent: "#fbbf24",
    },
  },
  {
    id: "joburg",
    name: "Joburg Lights",
    blurb: "City of gold — the final climb.",
    palette: {
      skyTop: "#101322",
      skyBottom: "#2b2440",
      silhouette: "#0a0c16",
      accent: "#ffd166",
    },
  },
];

export function chapterTheme(index1Based: number): ChapterTheme {
  return CHAPTER_THEMES[
    Math.min(index1Based - 1, CHAPTER_THEMES.length - 1)
  ];
}
