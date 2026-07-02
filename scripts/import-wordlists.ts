// Imports data/wordlists/<track>/{answers,guesses}.draft.csv into the DB.
// Answers land as status='draft' (never overwriting an existing row, so an
// 'approved' status set during review survives re-imports). Every answer is
// also inserted into words_guesses — an answer must always be guessable.
//
// Usage: npm run import-wordlists [-- --tracks xh,en]

import { existsSync } from "node:fs";
import path from "node:path";
import { adminClient, insertBatched, parseWordCsv } from "./lib";

async function main() {
  const tracksArg = process.argv.indexOf("--tracks");
  const tracks =
    tracksArg !== -1
      ? process.argv[tracksArg + 1].split(",")
      : ["xh", "en"];
  const supabase = adminClient();

  for (const track of tracks) {
    const dir = path.join("data", "wordlists", track);
    const answersPath = path.join(dir, "answers.draft.csv");
    const guessesPath = path.join(dir, "guesses.draft.csv");
    if (!existsSync(answersPath)) {
      console.warn(`skip ${track}: ${answersPath} not found`);
      continue;
    }

    const answers = parseWordCsv(answersPath);
    const guesses = existsSync(guessesPath)
      ? parseWordCsv(guessesPath)
      : { rows: [], invalid: [] };
    for (const bad of [...answers.invalid, ...guesses.invalid]) {
      console.warn(`  [${track}] skipped invalid word: "${bad}"`);
    }

    await insertBatched(
      supabase,
      "words_answers",
      answers.rows.map(({ word }) => ({
        track_code: track,
        word,
        status: "draft",
        source: "ai-draft",
      })),
      "track_code,word",
    );

    const guessWords = new Set([
      ...answers.rows.map((r) => r.word),
      ...guesses.rows.map((r) => r.word),
    ]);
    await insertBatched(
      supabase,
      "words_guesses",
      [...guessWords].map((word) => ({ track_code: track, word })),
      "track_code,word",
    );

    console.log(
      `[${track}] imported ${answers.rows.length} answers, ` +
        `${guessWords.size} guess words`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
