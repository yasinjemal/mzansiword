# Feature RFCs

**Before any non-trivial feature is coded, it gets an RFC.** One markdown, then
code. An RFC forces the [feature pipeline](../AGENTS-OS.md#the-feature-pipeline-no-step-skipped)
onto the page — research, emotion, cost, accessibility, alternatives — and makes
the decision reviewable *before* effort is spent.

**RFC vs. ADR:** an RFC is a *proposal* (may be rejected or reshaped); an
[ADR](../ADR/) records a *decided* structural choice permanently. A big RFC that's
accepted often produces an ADR.

## The self-critique requirement (non-negotiable)

Every RFC must spend **at least 20% of its length arguing against itself** — hidden
costs, maintenance burden, performance/accessibility implications, and honest
reasons *not* to build it. This mirrors the rule in [`../../CLAUDE.md`](../../CLAUDE.md).
An RFC with a weak "Case against" is not ready for review.

## Index

| RFC | Title | Status |
|---|---|---|
| [0001](./0001-unified-cross-mode-streak.md) | Unified cross-mode streak | Accepted — Slice A shipped |
| [0002](./0002-streak-shields-and-repair.md) | Streak shields & free repair | Accepted — B1 shipped, B2 staged |
| [0003](./0003-perfect-week-gold-state.md) | Perfect Week (weekly gold pride state) | Accepted — v1 shipped, v2 staged |
| [0004](./0004-friend-challenges.md) | Friend challenges ("beat my score") | Accepted — v1 shipped |

## Template

```markdown
# RFC-NNNN — <title>

- **Status:** Draft | In review | Accepted | Rejected | Superseded
- **Author / Deciders:** <roles>
- **Date:** YYYY-MM-DD

## Problem
What's wrong today, for whom, and why it matters.

## Named emotion (Principle 6)
The one-sentence feeling this creates. If you can't name it, stop.

## Research
Competitors, evidence, prior art (cite RESEARCH-2026.md / Bible §).

## Proposal
The design, concretely enough to build.

## Cost
Performance (KB JS / CSS, FPS), battery, backend, maintenance.

## Accessibility
Reduced motion, colour-blind, one-thumb, plain language.

## Legal / safety
CPA / POPIA / anti-cheat implications, if any.

## Alternatives
A / B / C and why they lose.

## Case against (≥20%)
The strongest honest argument for NOT doing this. Hidden costs, risks, the
"do nothing" option. Be your own harshest reviewer.

## Decision
What we're doing, and the metric that will judge it (ANALYTICS.md).
```
