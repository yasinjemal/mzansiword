// Applies a native-speaker word review to words_answers.status, replacing the
// hand-written SQL in docs/wordlist-review-checklist.md. Reads a reviewed
// decisions CSV (`word,decision[,correction]`; keep | drop | fix), plans the
// changes with the pure core (src/lib/wordlist/review), and — only with
// --apply — flips statuses, upserts corrected words (as approved, into answers
// AND guesses), and writes an audit_log row. Dry-run by default: it prints the
// plan and touches nothing, so an operator always sees the diff first.
//
// Usage:
//   npm run approve-words -- --track xh --reviewer "N. Speaker"          # dry run
//   npm run approve-words -- --track xh --reviewer "N. Speaker" --apply  # write
//   (optional) --file path/to/decisions.csv   default: data/wordlists/<track>/answers.reviewed.csv

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { adminClient, insertBatched } from "./lib";
import { parseReviewCsv, planReview } from "../src/lib/wordlist/review";
import { blocklistCoverage, screenWords } from "../src/lib/wordlist/safety";

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const track = argValue("--track");
  const reviewer = argValue("--reviewer");
  const apply = process.argv.includes("--apply");
  const file =
    argValue("--file") ??
    path.join("data", "wordlists", track ?? "", "answers.reviewed.csv");

  if (!track) throw new Error("--track <code> is required (e.g. --track xh)");
  if (!reviewer) {
    throw new Error(
      '--reviewer "Name" is required (recorded in audit_log for CPA records)',
    );
  }
  if (!existsSync(file)) {
    throw new Error(
      `decisions file not found: ${file}\n` +
        `Give the reviewer answers.draft.csv, collect a word,decision[,correction] ` +
        `CSV, and save it there (or pass --file).`,
    );
  }

  const { decisions, errors: parseErrors } = parseReviewCsv(
    readFileSync(file, "utf8"),
  );
  const plan = planReview(decisions);

  // Offensive screen (CONTENT_PIPELINE.md gate 3): no word going live may be on
  // the blocklist. Only words that would become playable matter — approve + the
  // corrected inserts; rejects are on their way out.
  const offensive = screenWords([...plan.approve, ...plan.insert], track);
  const errors = [
    ...parseErrors,
    ...plan.errors,
    ...offensive.map((w) => `"${w}" is on the offensive blocklist — cannot approve`),
  ];

  console.log(
    `[${track}] ${decisions.length} decisions → ` +
      `approve ${plan.approve.length}, reject ${plan.reject.length}, ` +
      `add-corrected ${plan.insert.length}`,
  );
  // Honesty: show whether this track is actually screened. A 0 means the
  // offensive filter is inert for it and human review is the only safeguard.
  const cov = blocklistCoverage();
  const trackTerms = cov[track] ?? 0;
  console.log(
    `offensive screen: ${cov.all} shared + ${trackTerms} ${track} terms` +
      (trackTerms === 0
        ? `  ⚠ no ${track}-specific terms yet — screening for this track relies on ` +
          `the shared list only; add a native-speaker list before trusting it`
        : ""),
  );
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing will be applied:`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  if (!apply) {
    console.log("\nDRY RUN — re-run with --apply to write these changes.");
    if (plan.insert.length) {
      console.log(`  corrected words to add as approved: ${plan.insert.join(", ")}`);
    }
    return;
  }

  const supabase = adminClient();

  // Order: reject bad answers, then add corrected words (approved, guessable),
  // then approve the kept ones. planReview already blocked any word that lands
  // in two buckets, so the order only affects corrected==other-word edge rows.
  if (plan.reject.length) {
    const { error } = await supabase
      .from("words_answers")
      .update({ status: "rejected" })
      .eq("track_code", track)
      .in("word", plan.reject);
    if (error) throw new Error(`reject failed: ${error.message}`);
  }

  if (plan.insert.length) {
    // Upsert with a real merge (not ignoreDuplicates) so an existing draft of a
    // corrected word is promoted to approved rather than left untouched.
    const { error } = await supabase.from("words_answers").upsert(
      plan.insert.map((word) => ({
        track_code: track,
        word,
        status: "approved",
        source: "reviewed",
      })),
      { onConflict: "track_code,word" },
    );
    if (error) throw new Error(`add-corrected failed: ${error.message}`);
    // An answer must always be guessable (same invariant as import-wordlists).
    await insertBatched(
      supabase,
      "words_guesses",
      plan.insert.map((word) => ({ track_code: track, word })),
      "track_code,word",
    );
  }

  if (plan.approve.length) {
    const { error } = await supabase
      .from("words_answers")
      .update({ status: "approved" })
      .eq("track_code", track)
      .in("word", plan.approve);
    if (error) throw new Error(`approve failed: ${error.message}`);
  }

  await supabase.from("audit_log").insert({
    actor: "system",
    action: "approve_words",
    payload: {
      track,
      reviewer,
      file,
      approved: plan.approve.length,
      rejected: plan.reject.length,
      added_corrected: plan.insert.length,
    },
  });

  console.log(
    `\n[${track}] applied by ${reviewer}: ` +
      `${plan.approve.length} approved, ${plan.reject.length} rejected, ` +
      `${plan.insert.length} corrected. Run schedule-puzzles to top up the runway.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
