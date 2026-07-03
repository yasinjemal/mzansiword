// Generates Journey levels from the CSV wordlists into committed JSON.
// Deterministic (seeded): rerunning with unchanged wordlists is a no-op diff.
// If a track can't fill 5 chapters × 12 levels, it automatically retries
// with relaxed constraints (thinner bonus requirements, word reuse) and
// keeps whichever run produced more levels — the manifest records reality
// and the UI is manifest-driven.
//
// Usage: npm run generate-journey [-- --tracks en,xh --seed <s>]

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseWordCsv } from "./lib";
import { generateTrack, type TrackOutput } from "../src/lib/journey/generate";
import { LEVELS_PER_CHAPTER, CHAPTER_CONFIGS } from "../src/lib/journey/generate";
import type { JourneyManifest } from "../src/lib/journey/types";

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function loadTrackWords(track: string): { common: string[]; all: string[] } {
  const dir = path.join("data", "wordlists", track);
  const answers = parseWordCsv(path.join(dir, "answers.draft.csv")).rows.map(
    (r) => r.word,
  );
  const guesses = parseWordCsv(path.join(dir, "guesses.draft.csv")).rows.map(
    (r) => r.word,
  );
  return { common: answers, all: [...answers, ...guesses] };
}

function levelCount(out: TrackOutput): number {
  return out.chapters.reduce((s, c) => s + c.length, 0);
}

function main() {
  const tracks = (argValue("--tracks") ?? "en,xh").split(",");
  const seed = argValue("--seed");
  const target = CHAPTER_CONFIGS.length * LEVELS_PER_CHAPTER;
  const outRoot = path.join("src", "data", "journey");
  const manifest: JourneyManifest = { tracks: {} };

  for (const track of tracks) {
    const { common, all } = loadTrackWords(track);
    console.log(`[${track}] dictionary: ${all.length} words (${common.length} common)`);

    let out = generateTrack({ track, common, all, seed });
    if (levelCount(out) < target) {
      const relaxed = generateTrack({ track, common, all, seed, relax: true });
      if (levelCount(relaxed) > levelCount(out)) {
        console.log(
          `[${track}] strict run gave ${levelCount(out)}/${target} — using relaxed run`,
        );
        out = relaxed;
      }
    }

    for (const line of out.report) console.log("  " + line);

    const dir = path.join(outRoot, track);
    mkdirSync(dir, { recursive: true });
    out.chapters.forEach((levels, i) => {
      writeFileSync(
        path.join(dir, `chapter-${i + 1}.json`),
        JSON.stringify(levels),
      );
    });
    manifest.tracks[track] = {
      chapters: out.chapters.map((levels, i) => ({
        index: i + 1,
        levelCount: levels.length,
      })),
      totalLevels: levelCount(out),
    };
    console.log(
      `[${track}] wrote ${out.chapters.length} chapters, ${levelCount(out)}/${target} levels`,
    );
  }

  writeFileSync(
    path.join(outRoot, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log("wrote manifest.json");
}

main();
