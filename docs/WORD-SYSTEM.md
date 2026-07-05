# WORD-SYSTEM.md

**Owner:** Learning Scientist + AI Engineer · **Canonical:** [Bible §13.4](./GAME-DESIGN-BIBLE.md#13-the-economy), [§4](./GAME-DESIGN-BIBLE.md#4-core-gameplay--a-critical-look-at-the-two-pillars)

**The wordlists are the real economy of a word game, and the #1 risk to the whole
plan (Principle 9, [`RISK-REGISTER.md`](./RISK-REGISTER.md) R1).** A word game thin
in its flagship differentiating language has a broken core, not a missing feature.

## Current state (2026-07) — the honest picture

- isiXhosa is a **~390-word DRAFT**, AI-generated, yielding only **~15 Journey
  levels**. English is deep; isiXhosa is shallow — which undercuts the entire
  national/educational positioning.
- Data lives in `words_answers` / `words_guesses` (loaded via
  `npm run import-wordlists`). The day's answer sits in a table with **no RLS
  policy** so client keys physically cannot read it ([`ARCHITECTURE.md`](./ARCHITECTURE.md)).
- Review checklist exists: [`wordlist-review-checklist.md`](./wordlist-review-checklist.md).

## Why this is on the critical path

- **Content gates Journey depth** ([`GAMEPLAY.md`](./GAMEPLAY.md)).
- **Content gates the education pitch** — you cannot promise curriculum coverage on
  ~15 levels ([`EDUCATION.md`](./EDUCATION.md)).
- **Content gates category-based Signature Moments** ("every animal word") and
  mastery collections ([`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md)).

## The plan

1. **Native-speaker review and expansion** of isiXhosa answer/guess lists — resource
   this *now*, continuously, not "later." This is business/content work as much as
   engineering (🧭 in [`PHASE-TRACKER.md`](./PHASE-TRACKER.md)).
2. **Category tagging** (animals, food, places, Grade-5 vocab, …) to power
   collections, mastery, and educational framing.
3. **Difficulty/frequency grading** aligned to reading level for the mastery model.
4. Regenerate Journey levels once the list is approved and deep enough.
5. Production scheduler runs **approved words only** (`schedule-puzzles` refuses
   `--allow-draft` on a production `NEXT_PUBLIC_APP_URL`).

## Quality bar

- Every production answer word passes native-speaker review (no AI-only words in
  prize puzzles or school content).
- Guess lists are permissive; answer lists are curated and culturally safe.
- No offensive/ambiguous words in a product used by minors.

## Next language

**isiZulu** (24.4%, the largest home language) is the obvious Year-2 expansion —
gated on content-pipeline maturity, not appetite.

## KPIs

Approved isiXhosa word count, Journey levels available per language, % answers
native-reviewed, category coverage, reading-level distribution.
