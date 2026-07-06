// Pure core for applying a native-speaker word review (docs/wordlist-review-
// checklist.md) to `words_answers.status`. The reviewer marks each draft answer
// keep / drop / fix; this turns those decisions into a concrete DB plan that the
// `approve-words` script executes. Pure + string-in so it is unit-testable with
// no database — the script is the only part that touches Supabase.

/** A valid puzzle word: 4–6 lowercase ASCII letters (matches the DB check). */
export const WORD_RE = /^[a-z]{4,6}$/;

export type Decision =
  | { word: string; action: "keep" }
  | { word: string; action: "drop" }
  | { word: string; action: "fix"; correction: string };

export interface ReviewPlan {
  /** Existing draft rows to flip to status='approved'. */
  approve: string[];
  /** Rows to flip to status='rejected' (bad answers + fix originals). */
  reject: string[];
  /** Corrected words to upsert as approved (answers + guesses); may be new. */
  insert: string[];
  /** Human-readable problems; a non-empty list should block --apply. */
  errors: string[];
}

/**
 * Parse a reviewed decisions CSV: `word,decision[,correction]` per row, `#`
 * comments and blank lines skipped. `decision` is keep | drop | fix; fix needs
 * a third `correction` column. Parsing never throws — bad rows become errors.
 */
export function parseReviewCsv(text: string): {
  decisions: Decision[];
  errors: string[];
} {
  const decisions: Decision[] = [];
  const errors: string[] = [];
  let lineNo = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    lineNo++;
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(",").map((p) => p.trim());
    const word = (parts[0] ?? "").toLowerCase();
    const action = (parts[1] ?? "").toLowerCase();
    if (action === "keep" || action === "drop") {
      decisions.push({ word, action });
    } else if (action === "fix") {
      const correction = (parts[2] ?? "").toLowerCase();
      decisions.push({ word, action: "fix", correction });
    } else {
      errors.push(
        `line ${lineNo}: unknown decision "${parts[1] ?? ""}" for "${word}" ` +
          `(expected keep | drop | fix)`,
      );
    }
  }
  return { decisions, errors };
}

/**
 * Fold decisions into a DB plan, validating words and catching contradictions
 * (a word both kept and dropped, a fix that doesn't change the word, an invalid
 * spelling). Order-independent; the caller applies `reject`, then `insert`,
 * then `approve`.
 */
export function planReview(decisions: Decision[]): ReviewPlan {
  const approve = new Set<string>();
  const reject = new Set<string>();
  const insert = new Set<string>();
  const errors: string[] = [];

  for (const d of decisions) {
    if (!WORD_RE.test(d.word)) {
      errors.push(`invalid word "${d.word}" (need 4–6 letters a–z)`);
      continue;
    }
    if (d.action === "keep") {
      approve.add(d.word);
    } else if (d.action === "drop") {
      reject.add(d.word);
    } else {
      // fix: reject the misspelling, approve the correction.
      if (!WORD_RE.test(d.correction)) {
        errors.push(
          `invalid correction "${d.correction}" for "${d.word}" ` +
            `(need 4–6 letters a–z)`,
        );
        continue;
      }
      if (d.correction === d.word) {
        // A "fix" that changes nothing is just a keep — don't reject it.
        approve.add(d.word);
        continue;
      }
      reject.add(d.word);
      insert.add(d.correction);
    }
  }

  // A word approved (or inserted) AND rejected is a contradiction — surface it
  // rather than silently letting apply-order decide.
  for (const w of reject) {
    if (approve.has(w) || insert.has(w)) {
      errors.push(`"${w}" is both approved and rejected — resolve the conflict`);
    }
  }

  return {
    approve: [...approve].sort(),
    reject: [...reject].sort(),
    insert: [...insert].sort(),
    errors,
  };
}
