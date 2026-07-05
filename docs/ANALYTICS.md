# ANALYTICS.md

**Owner:** Data Scientist · **Canonical:** [Bible §5](./GAME-DESIGN-BIBLE.md#5-retention-architecture), [§17](./GAME-DESIGN-BIBLE.md#17-roadmaps)

**Everything measured, nothing guessed** (Principle 4). Analytics exists to answer
one question for every feature: *did retention, learning, or ethical revenue
actually move?* If a feature can't be instrumented, it can't be evaluated — and it
doesn't ship ([`AGENTS-OS.md`](./AGENTS-OS.md) pipeline step 15).

## The instrumentation that exists

`/api/track`, `track-event.ts`, and the `events` table (migration 0003) capture
gameplay events. Build the dashboards below on top of this.

## North-star and guardrail metrics

- **North star: retained DAU** (DAU that doesn't decay). Everything is downstream.
- **Retention:** D1 / D7 / D30 (targets 40 / 20 / 10 — [`RETENTION.md`](./RETENTION.md)),
  streak-length distribution, 0→7-day funnel.
- **Growth:** K-factor, viral cycle time, share rate per DAU, referral activation
  ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)).
- **Engagement:** session length (guardrail: stay ~3–5 min, don't inflate),
  daily-solve rate, Journey completion, moment fire rate.
- **Learning:** words learned, categories mastered, reading-level lift
  ([`EDUCATION.md`](./EDUCATION.md)) — funding-grade rigor.
- **Revenue:** ARPDAU, ad opt-in %, eCPM by network, sub conversion, cosmetic
  attach ([`MONETIZATION.md`](./MONETIZATION.md)).
- **Performance:** bundle KB, FPS, TTI, cache hit rate ([`PERFORMANCE.md`](./PERFORMANCE.md)).
- **Fairness:** cheat-catch rate, false-positive rate ([`ANTI-CHEAT.md`](./ANTI-CHEAT.md)).

## Ethical guardrails on measurement

- **Don't optimize session length for its own sake** — flow beats compulsion.
  Inflating time-in-app by removing stopping points is a dark pattern (Principle 2).
- **POPIA-compliant** — data minimization, especially for minors; don't collect
  what you don't need ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)).
- **Experiment honestly** — pre-register the hypothesis and the success metric;
  don't fish for a win after the fact.

## Method

Cohort retention curves, A/B on the 0→7 window (where Duolingo runs most
experiments), and per-feature before/after on the metric it claimed to move.
Record outcomes in [`DECISION-LOG.md`](./DECISION-LOG.md).
