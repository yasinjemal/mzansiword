# 0002 — Rive mascot parked until retention is proven

- **Status:** Accepted
- **Date:** 2026-07-06 (documenting a standing decision)
- **Deciders:** Creative Director, Executive Game Director
- **Relates to:** [Bible §4](../GAME-DESIGN-BIBLE.md#4-core-gameplay--a-critical-look-at-the-two-pillars); [`DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md); [`DECISION-LOG.md`](../DECISION-LOG.md)

## Context

A characterful mascot (e.g. via Rive) is tempting for warmth and brand. But
mascots are a *delight* layer, and the evidence is that delight doesn't move
retention until players already love the core loop. Rive also adds runtime weight
and a new dependency against a strict performance budget
([`PERFORMANCE.md`](../PERFORMANCE.md)), and animation work competes for time with
the retention spine (streak, league, content).

## Decision

**Park the mascot.** Do not build a Rive/animated mascot now. Revisit only after
the streak and league metrics are healthy (retention is the gate, not appetite).

## Consequences

- **Easier:** engineering focus stays on retention and content
  ([`RETENTION.md`](../RETENTION.md), [`WORD-SYSTEM.md`](../WORD-SYSTEM.md)); no new
  runtime dependency or KB cost; no sunk cost in art for an unproven game.
- **Harder:** the game is less "cute" in early screenshots. Accepted — cuteness
  before stickiness is a known trap (priority order A retention → B feel → C
  delight, GAME-FEEL.md).

## Alternatives considered

- **Build the mascot now** — rejected: spends the delight budget before the game is
  sticky; the exact temptation this ADR exists to resist.
- **Static (non-Rive) mascot** — deferred: acceptable later as a cheap middle
  ground, but still not before retention is proven.

## Trigger to reopen

Streak retention and weekly-league engagement hit healthy targets
([`ANALYTICS.md`](../ANALYTICS.md)); then re-evaluate via an RFC.
