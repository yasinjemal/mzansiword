// Validates every committed level JSON against the layout rules and the
// current CSV dictionaries — catches hand-edits and wordlist drift.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateLevel } from "@/lib/journey/validate";
import type { JourneyLevel, JourneyManifest } from "@/lib/journey/types";

const root = path.join(__dirname);
const manifest: JourneyManifest = JSON.parse(
  readFileSync(path.join(root, "manifest.json"), "utf8"),
);

function loadDictionary(track: string): Set<string> {
  const dict = new Set<string>();
  for (const file of ["answers.draft.csv", "guesses.draft.csv"]) {
    const csv = readFileSync(
      path.join(root, "..", "..", "..", "data", "wordlists", track, file),
      "utf8",
    );
    for (const line of csv.split(/\r?\n/)) {
      const word = line.split(",")[0]?.trim().toLowerCase();
      if (/^[a-z]{4,6}$/.test(word)) dict.add(word);
    }
  }
  return dict;
}

describe.each(Object.keys(manifest.tracks))("journey data: %s", (track) => {
  const dict = loadDictionary(track);
  const entry = manifest.tracks[track];

  it("manifest matches the chapter files", () => {
    let total = 0;
    for (const ch of entry.chapters) {
      const levels: JourneyLevel[] = JSON.parse(
        readFileSync(path.join(root, track, `chapter-${ch.index}.json`), "utf8"),
      );
      expect(levels).toHaveLength(ch.levelCount);
      total += levels.length;
    }
    expect(total).toBe(entry.totalLevels);
  });

  it("every level is valid against the dictionary", () => {
    for (const ch of entry.chapters) {
      const levels: JourneyLevel[] = JSON.parse(
        readFileSync(path.join(root, track, `chapter-${ch.index}.json`), "utf8"),
      );
      for (const level of levels) {
        expect(validateLevel(level, dict), level.id).toEqual([]);
      }
    }
  });
});
