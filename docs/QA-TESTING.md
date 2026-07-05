# QA-TESTING.md

**Owner:** QA Lead · **Canonical:** [Bible §15–16](./GAME-DESIGN-BIBLE.md#15-technical-architecture)

Nothing ships broken. For a prize-linked game, a scoring or draw bug isn't a
cosmetic defect — it's a fairness and legal incident. Verification rigor scales
with how close a system sits to real money.

## The existing test suite (`npm test`, vitest)

- **Engine / scoring** (`engine/score.ts`) — correctness of guess evaluation.
- **Time-boundary** — daily rollover at SA time (no DST) behaves correctly.
- **RNG / draw** (`draw/rng.ts`, `verify-draw`) — draws reproduce exactly from
  their seed. This is also the CPA audit mechanism ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)).
- **Share card** (`share.ts`) — spoiler-free output, correct emoji grid + streak.
- **Signature detection** — 14/14 pure-detection tests
  ([`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md)).

## Test priority by money-proximity

1. **Prize-touching (highest rigor):** scoring, draw selection, prize claim,
   payout, anti-cheat exclusion. Server-authoritative; unit + integration +
   auditable reproduction. A bug here can create an illegal-lottery or
   wrong-winner event.
2. **Retention spine:** streak advance/shield/repair, league standings, time
   boundaries.
3. **Client-authoritative (Journey):** economy clamps, offline resume, level
   generation — lower legal stakes, still player-facing quality.

## Standing QA gates (every release)

- [ ] `npm test`, `npm run lint`, `npm run build` pass locally *(the build sandbox
      can't always run the Windows-native toolchain — verify on a real machine,
      see [`PHASE-TRACKER.md`](./PHASE-TRACKER.md)).*
- [ ] Migrations applied (`npx supabase db push`) and tested.
- [ ] **First-minute audit** — no new feature gates the opening win
      ([`UX-GUIDELINES.md`](./UX-GUIDELINES.md), Principle 3).
- [ ] **Performance budget** — bundle KB and FPS on low-end Android
      ([`PERFORMANCE.md`](./PERFORMANCE.md)).
- [ ] **Accessibility** — reduced-motion + colour-blind pass
      ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md)).
- [ ] **Verify by playing** — real low-end Android where possible, else headless
      at 414×896.

## Honesty rule

From the phase tracker: **🟡 (partial) is more useful than an optimistic ✅.**
Never mark a task done with tests failing or implementation partial. QA status
must reflect reality, not hope.

## KPIs

Escaped-defect rate, prize-path defect rate (target: 0), regression count,
build/test pass rate.
