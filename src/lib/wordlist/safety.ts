// Offensive-word screen for puzzle content (CONTENT_PIPELINE.md gate 3).
//
// Threat model: a genuinely offensive word slips into a *curated* answer/guess
// list or a generated Journey grid and reaches a player — a PR disaster for a
// product that admits minors and schools. It is NOT adversarial user input, so:
//
//  • We match WHOLE words, exact + case-insensitive — never substrings. Every
//    game word is one curated 4–6 letter token, so exact match is sufficient and
//    avoids the Scunthorpe problem ("grass" must never flag because of "ass").
//  • No leet/obfuscation normalization — there is no attacker mangling spelling;
//    that machinery would only add false positives.
//
// Honesty: a blocklist is only as good as its terms. The English seed below is a
// starting point, not exhaustive; the per-language lists MUST be filled by native
// speakers (isiXhosa/Afrikaans/isiZulu slurs are invisible to an English list).
// `blocklistCoverage()` exists so callers can SEE when a track is unscreened
// rather than assume it's safe. An empty list screens nothing — say so, loudly.

/**
 * Blocklisted terms per scope. `all` = terms offensive to any player of an
 * English-facing app regardless of track (English profanity/slurs). Per-track
 * scopes hold language-specific terms. Screening a word uses `all` ∪ its track.
 *
 * Seed is deliberately modest and unambiguous; expand via review. Keep entries
 * lowercase, 3–6 letters (only 4–6 can be game words, but 3-letter guards cost
 * nothing). Populating `xh`/`af`/`zu` is a native-speaker task (RISK R1).
 */
const BLOCKLIST_TERMS: Record<string, readonly string[]> = {
  // English profanity + well-known slurs, unambiguous cases only. Not exhaustive.
  all: [
    "shit",
    "fuck",
    "cunt",
    "twat",
    "damn",
    "piss",
    "cock",
    "dick",
    "slut",
    "whore",
    "bitch",
    "nigga",
    "spic",
    "kike",
    "chink",
    "gook",
    "coon",
    "kaffir",
    "kafir",
    "moffie",
    "poes",
    "doos",
    "naai",
  ],
  en: [],
  xh: [], // TODO(native review): isiXhosa offensive terms — screening inert until filled
  af: [], // TODO(native review): Afrikaans offensive terms
  zu: [], // TODO(native review): isiZulu offensive terms
};

function normalize(word: string): string {
  return word.trim().toLowerCase();
}

/**
 * The set of terms a word is screened against for a track: the language-agnostic
 * `all` list unioned with the track's own list. With no track, unions every
 * scope (the strictest screen — used when auditing a mixed/unknown source).
 */
export function offensiveSet(track?: string): ReadonlySet<string> {
  const scopes = track ? ["all", track] : Object.keys(BLOCKLIST_TERMS);
  const set = new Set<string>();
  for (const scope of scopes) {
    for (const term of BLOCKLIST_TERMS[scope] ?? []) set.add(term);
  }
  return set;
}

/** Whole-word, case-insensitive membership — the pure primitive (no substrings). */
export function isBlocklisted(word: string, set: ReadonlySet<string>): boolean {
  return set.has(normalize(word));
}

/** Words from `words` that hit the blocklist for `track`, in input order, deduped. */
export function screenWords(words: Iterable<string>, track?: string): string[] {
  const set = offensiveSet(track);
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    const n = normalize(w);
    if (set.has(n) && !seen.has(n)) {
      seen.add(n);
      hits.push(n);
    }
  }
  return hits;
}

/** Convenience for a single word against a track (all ∪ track). */
export function isOffensive(word: string, track?: string): boolean {
  return isBlocklisted(word, offensiveSet(track));
}

/**
 * Term count per scope, so a caller can report screening effectiveness. A scope
 * of 0 means that language is NOT actually screened yet — surface it, don't hide.
 */
export function blocklistCoverage(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [scope, terms] of Object.entries(BLOCKLIST_TERMS)) {
    out[scope] = terms.length;
  }
  return out;
}
