# RFC-0001 — Unified cross-mode streak

- **Status:** Accepted — Slice A (unification) implemented 2026-07-06; Slice B (shields + repair) next
- **Author / Deciders:** Senior Game Designer, Behavioral Psychologist, Backend Architect
- **Date:** 2026-07-06

## Problem

MzansiWord has two pillars — the Daily Prize Game and Journey — that share almost
no progression. A player can hold a 40-day daily streak and a 3-chapter Journey and
feel like they're using two apps. The streak is our retention spine
([`RETENTION.md`](../RETENTION.md)), but today only the daily game advances it
(`profiles.current_streak`, set in `/api/guess`); **Journey completions don't count.**
That splits the habit and wastes the engagement Journey already produces.

## Named emotion (Principle 6)

*"Everything I do here keeps my streak alive."* One player, one habit, one flame —
returning is always rewarded, whichever mode you had time for today.

## Research

Loss aversion is the strongest retention force there is; Duolingo's streak is its
single biggest growth driver, retention "locks in" at 7 days, and >half of daily
learners now hold 7+ day streaks ([`RESEARCH-2026.md`](../RESEARCH-2026.md) §3).
The lesson is *one* prominent streak, not several competing ones — multiple streaks
dilute the very loss aversion that makes them work.

## Proposal

Any qualifying daily action — solving the daily puzzle **or** completing a Journey
level — advances a single profile streak. Implement a streak service that both
`/api/guess` and the Journey completion path (`/api/journey/complete`) call, keyed
to SA-timezone day boundaries (already handled by the daily game's time logic).
Grant 2 free shields to new players and free effort-based repair
([`RETENTION.md`](../RETENTION.md)) in the same service.

## Cost

- **Backend:** small — a shared streak-advance function + one column already exists;
  Journey completion route calls it. No new heavy infra.
- **Client:** negligible KB; the flame UI already exists.
- **Maintenance:** low, and *net-negative* long-term (one streak system instead of
  the two we'd otherwise drift into).

## Accessibility

No new motion; streak state must remain legible without colour and announced to
screen readers ([`ACCESSIBILITY.md`](../ACCESSIBILITY.md)).

## Legal / safety

None — streaks are free, earned, and confer no prize advantage (Principle 1).
Shields/repair are grant-only, never sold.

## Alternatives

- **A. Keep two separate streaks** — rejected: dilutes loss aversion, confuses the
  player, doubles the surface.
- **B. Only the daily puzzle counts (status quo)** — rejected: wastes Journey
  engagement and punishes players who only had time for Journey today.
- **C. A combined "activity" number that isn't a streak** — rejected: loses the
  loss-aversion mechanic that is the whole point.

## Case against (the honest 20%)

Unifying the streak means **Journey can now save a daily-game lapse**, which
slightly lowers the pressure to open the prize game specifically — the prize game
is the legal product and the appointment ([`GAMEPLAY.md`](../GAMEPLAY.md)), so we
may trade a little daily-puzzle DAU for overall retention. There's also a **content
risk**: with isiXhosa Journey thin (~15 levels, [R1](../RISK-REGISTER.md)), a player
could exhaust Journey and be pushed back to the daily game anyway, muddying the
metric. And a unified streak raises the stakes of a **streak bug** — one defect now
threatens the spine across both modes, so QA rigor must rise
([`QA-TESTING.md`](../QA-TESTING.md)). None of these outweigh the benefit, but they
mean: keep a distinct "daily puzzle played" sub-metric so we can watch for prize-
game cannibalization, and treat the streak service as prize-adjacent for testing.

## Decision

Build the unified streak service. **Judged by:** overall D7/D30 lift and streak-
length distribution, with a guardrail sub-metric on daily-puzzle participation to
catch cannibalization ([`ANALYTICS.md`](../ANALYTICS.md)).
