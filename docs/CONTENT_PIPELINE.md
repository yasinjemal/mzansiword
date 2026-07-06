# CONTENT_PIPELINE.md — the lifecycle of every word & puzzle

**Owner:** Content + Engineering · **Last updated: 2026-07-06**

Every piece of playable content — a daily answer, a Journey grid, a bonus word —
travels the same path from raw candidate to retired. This is that path, mapped to
the **real tool or file** at each stage and its **honest status**. A stage that
doesn't exist yet says so; a gate that can be bypassed is a bug.

> **Boundary:** this is the *operational* content doc. The *why* of word choice is
> [`wordlist-review-checklist.md`](./wordlist-review-checklist.md); the *design*
> constraints are the [Bible](./GAME-DESIGN-BIBLE.md) §13. If this disagrees with
> the code, the code wins — fix this file.

## The pipeline

```
 1  Candidate word        data/wordlists/<track>/{answers,guesses}.draft.csv
        │
 2  Dictionary import     npm run import-wordlists            → words_answers (draft)
        │
 3  Native review         docs/wordlist-review-checklist.md   (human, per language)
        │
 4  Offensive screen  ◄── GATE ── src/lib/wordlist/safety.ts  (blocks approval + generation)
        │
 5  Difficulty tag        (not built — blocked on corpora, R1)
        │
 6  Generation            daily: schedule-puzzles · Journey: generate-journey
        │
 7  Solver / validation ◄ GATE ── src/lib/journey/validate.ts (refuses invalid levels)
        │
 8  QA                    data-test over committed levels + native sign-off
        │
 9  Scheduling            npm run schedule-puzzles  (approved words only, prod-safe)
        │
10  Publish               puzzles table → /api/puzzle/today, /api/journey
        │
11  Analytics             events table → /api/track  (basic)
        │
12  Retire / update       words_answers.status → re-run schedule / regenerate
```

## Stage status (honest)

| # | Stage | Tool / file | Status |
|---|---|---|---|
| 1 | Candidate word | [`data/wordlists/`](../data/wordlists/) `*.draft.csv` | ✅ exists — **all DRAFT** (English too) |
| 2 | Dictionary import | [`scripts/import-wordlists.ts`](../scripts/import-wordlists.ts) | ✅ imports as `status='draft'`, idempotent |
| 3 | Native review | [`wordlist-review-checklist.md`](./wordlist-review-checklist.md) → [`scripts/approve-words.ts`](../scripts/approve-words.ts) | 🟡 tool built; **isiXhosa review not yet done** (R1) |
| 4 | **Offensive screen** | [`src/lib/wordlist/safety.ts`](../src/lib/wordlist/safety.ts) | 🟡 mechanism ✅ + wired into gates; **per-language lists thin** — reports its own coverage |
| 5 | Difficulty tag | — | ⬜ not built — blocked on frequency/grade corpora (R1); English-derivable subset feasible |
| 6 | Generation | [`schedule-puzzles.ts`](../scripts/schedule-puzzles.ts) (daily) · [`generate-journey.ts`](../scripts/generate-journey.ts) (Journey) | ✅ both exist, deterministic |
| 7 | **Solver / validation** | [`src/lib/journey/validate.ts`](../src/lib/journey/validate.ts) | ✅ formability, bounds, clashes, connectivity, uniqueness, dictionary, offensive; generator **refuses** invalid levels |
| 8 | QA | [`generate.test.ts`](../src/lib/journey/generate.test.ts) data-test + human sign-off | 🟡 structural QA automated; content QA is the native review |
| 9 | Scheduling | [`schedule-puzzles.ts`](../scripts/schedule-puzzles.ts) | ✅ **approved-only**, refuses `--allow-draft` on prod |
| 10 | Publish | `puzzles` table → [`/api/puzzle/today`](../src/app/api/puzzle/today/route.ts) | ✅ |
| 11 | Analytics | `events` table → [`/api/track`](../src/app/api/track/route.ts) | 🟡 basic events; no content-performance view yet |
| 12 | Retire / update | `words_answers.status` + re-schedule | 🟡 manual (flip status, reschedule); no automated rotation/retirement |

## Gates — nothing bypasses these

A **gate** is a hard stop: content that fails it cannot reach a player.

1. **Approved-only scheduling** (stage 9). `schedule-puzzles` draws exclusively
   from `status='approved'`; it refuses `--allow-draft` against production. So a
   word reaches the daily game *only* after native review + approval.
2. **Level validation** (stage 7). `generateTrack` throws on any `validateLevel`
   error, so a structurally broken or offensive Journey level is never emitted.
3. **Offensive screen** (stage 4). `approve-words` refuses to approve a
   blocklisted word; `generate` excludes blocklisted words from the candidate pool
   *and* re-checks in `validateLevel`. Two independent chokepoints — approval
   (daily) and generation (Journey) — so no offensive word reaches either mode.

## Honest gaps (do not pretend these are done)

- **Offensive blocklist is English-seeded only.** `blocklistCoverage()` reports 0
  isiXhosa/Afrikaans/isiZulu terms today; for those languages the screen catches
  only words that also read as English slurs. **Human native review is still the
  primary safeguard until the per-language lists are populated** — the filter is
  defense-in-depth, not a replacement. `approve-words` prints this warning on every
  run so it can't be forgotten.
- **No difficulty metadata (stage 5).** Puzzle difficulty is implicit (Journey
  ramps by formable-word count; daily is unweighted). A real difficulty engine
  needs frequency/grade corpora that barely exist for isiXhosa — a data/partnership
  task, not a coding one (R1). This is the highest-value *future* content system.
- **No content-performance analytics (stage 11) or automated retirement (12).**
  We publish and measure play, but don't yet feed solve-rate/abandon data back to
  retire too-hard or stale words. Fine for the pilot; needed at scale.

## When you add a new content type

Route it through this pipeline — don't invent a side door. A tournament word set, a
sponsored theme pack, or a new language all pass stages 1–12. The gates (approval,
validation, offensive screen) are the invariant; the source and schedule vary.
