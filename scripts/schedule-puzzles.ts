// Schedules daily puzzles ahead of time, one per enabled track per SAST
// date. Idempotent: dates that already have a puzzle are left alone, and a
// word is never reused within a track. Only 'approved' answers are eligible;
// --allow-draft exists for local development and refuses to run against
// production (guessed from NEXT_PUBLIC_APP_URL).
//
// Usage: npm run schedule-puzzles [-- --days 90 --from 2026-07-06 --allow-draft]

import { adminClient } from "./lib";
import { addDays, sastToday } from "../src/lib/time";
import { newSeed, seededShuffle } from "../src/lib/draw/rng";

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const days = Number(argValue("--days") ?? 90);
  const from = argValue("--from") ?? sastToday();
  const allowDraft = process.argv.includes("--allow-draft");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !Number.isInteger(days) || days < 1) {
    throw new Error("--from must be YYYY-MM-DD and --days a positive integer");
  }
  if (allowDraft) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (appUrl.includes("mzansiword.co.za")) {
      throw new Error(
        "--allow-draft refused: NEXT_PUBLIC_APP_URL points at production. " +
          "Approve words via the review process instead.",
      );
    }
    console.warn(
      "WARNING: scheduling DRAFT words — dev only, never for a public launch.",
    );
  }

  const supabase = adminClient();
  const dates = Array.from({ length: days }, (_, i) => addDays(from, i));

  const { data: tracks, error: trackErr } = await supabase
    .from("language_tracks")
    .select("code")
    .eq("enabled", true);
  if (trackErr) throw new Error(trackErr.message);

  for (const { code: track } of tracks ?? []) {
    const statuses = allowDraft ? ["approved", "draft"] : ["approved"];
    const { data: words, error: wordsErr } = await supabase
      .from("words_answers")
      .select("word")
      .eq("track_code", track)
      .in("status", statuses);
    if (wordsErr) throw new Error(wordsErr.message);

    const { data: existing, error: existErr } = await supabase
      .from("puzzles")
      .select("puzzle_date, answer")
      .eq("track_code", track);
    if (existErr) throw new Error(existErr.message);

    const usedWords = new Set((existing ?? []).map((p) => p.answer));
    const usedDates = new Set((existing ?? []).map((p) => p.puzzle_date));
    const candidates = (words ?? [])
      .map((w) => w.word)
      .filter((w) => !usedWords.has(w));
    const openDates = dates.filter((d) => !usedDates.has(d));

    if (openDates.length === 0) {
      console.log(`[${track}] all ${days} dates already scheduled`);
      continue;
    }
    if (candidates.length < openDates.length) {
      throw new Error(
        `[${track}] only ${candidates.length} unused answers for ` +
          `${openDates.length} open dates — approve more words first`,
      );
    }

    const seed = newSeed();
    const shuffled = seededShuffle(candidates, seed, `schedule:${track}`);
    const rows = openDates.map((puzzle_date, i) => ({
      track_code: track,
      puzzle_date,
      answer: shuffled[i],
      length: shuffled[i].length,
    }));

    const { error: insertErr } = await supabase.from("puzzles").insert(rows);
    if (insertErr) throw new Error(insertErr.message);

    await supabase.from("audit_log").insert({
      actor: "system",
      action: "schedule_puzzles",
      payload: {
        track,
        from,
        days,
        scheduled: rows.length,
        seed,
        draft_words_allowed: allowDraft,
      },
    });
    console.log(
      `[${track}] scheduled ${rows.length} puzzles ` +
        `(${openDates[0]} → ${openDates[openDates.length - 1]})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
