# GAMEPLAY.md

**Owner:** Senior Game Designer · **Canonical:** [Bible §4](./GAME-DESIGN-BIBLE.md#4-core-gameplay--a-critical-look-at-the-two-pillars)

MzansiWord is two games sharing one shell — a structure that is *smart and should
be kept* (it mirrors NYT: a free shared daily as the funnel, a deep second game
as the retention engine).

## The two pillars

1. **The Daily Prize Game** — a server-validated daily word puzzle; solvers enter
   a nightly random airtime draw. This is the **appointment** and the **legal
   product**. Wordle-style, spoiler-free share.
   - Code: `/api/guess`, `/api/puzzle/today`, `/api/play/state`,
     `engine/score.ts`, `Board`/`Game`/`Keyboard`/`ResultPanel`. **Shipped.**
2. **Journey Mode** — a Words-of-Wonders / Wordscapes-style letter-wheel crossword
   with coins, hints, bonus words, and SA-landmark chapters. Client-authoritative,
   **no prizes** (so cheating wins nothing; offline feedback matters more). This is
   the **depth** and the daily habit filler.
   - Code: `journey/generate·layout·reducer·economy·loader`, `LetterWheel`,
     `CrosswordGrid`, `JourneyGame`, `JourneyMap`. **Shipped.**

## The one gameplay decision that matters most next

The pillars currently share almost no progression — a player can have a 40-day
daily streak and a 3-chapter Journey and feel like they're playing two apps.
**Unify them under one identity and one streak** (two games, one player, one
habit). This is the current Phase-1 priority — see [`RETENTION.md`](./RETENTION.md)
and [`PROGRESSION.md`](./PROGRESSION.md).

## Hard design gates

- **The 60-second rule (Principle 3).** A first-time player must reach a win and
  an "aha" in under 60 seconds — no signup, tutorial wall, or download in front of
  it. Every feature runs a first-minute audit each slice
  ([`PHASE-TRACKER.md`](./PHASE-TRACKER.md)).
- **Name the emotion (Principle 6).** "I almost got it," "I discovered a word,"
  "I beat my school," "I won data." A feature that can't name its emotion doesn't
  ship.
- **Respect the stopping point.** The daily loop ends clean at 3–5 minutes; never
  punish stopping (Bible §3.5).

## Content risk (read this)

The biggest gameplay risk is **isiXhosa depth** — Journey generates only ~15
levels from a ~390-word draft. A word game thin in its flagship language has a
broken core, not a missing feature. Content is on the critical path
([`WORD-SYSTEM.md`](./WORD-SYSTEM.md), Principle 9).

## KPIs

D1, session length (3–5 min), first-minute-to-win pass rate, daily-puzzle solve
rate, Journey level completion rate.
