# MzansiWord — Documentation System

**Read these first, in order:** [`NORTH_STAR.md`](./NORTH_STAR.md) (what we're for)
→ [`PRINCIPLES.md`](./PRINCIPLES.md) (how we behave) →
[`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md) (the canonical design).
For *right now*, see the live dashboard [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).

**The Bible is frozen.** It is the single source of truth and should change
*rarely* (treat it like a studio's core design doc). Day-to-day change happens in
the things *around* it — the [Decision Log](./DECISION-LOG.md),
[Roadmap](./ROADMAP.md), [Research](./RESEARCH-2026.md), [ADRs](./ADR/), and
[RFCs](./RFC/). Everything in this folder is subordinate to the Bible and the
constitution.

This system was deliberately built as a **hub-and-spoke**, not a pile of 50
overlapping files: the Bible holds the strategy and the argument; each spoke doc
adds the *operational* layer (owner, current status, KPIs, open questions) and
links back to its Bible section. Sprawl is the anti-pattern the Bible itself warns
against (§18.4), so docs earn their place or they're folded in.

## Start here (the constitution layer)

| Doc | What it is |
|---|---|
| [`NORTH_STAR.md`](./NORTH_STAR.md) | **The highest doc.** Four questions that decide what belongs. The final gate above all others. |
| [`PRINCIPLES.md`](./PRINCIPLES.md) | **The constitution.** The Prime Directive, 12 principles, quality gates. Binding on every feature and agent. |
| [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md) | The full strategic & business design (§1–20). Frozen source of truth. |
| [`AGENTS-OS.md`](./AGENTS-OS.md) | The operating system: agent roster, feature pipeline, approval gates. |
| [`RESEARCH-2026.md`](./RESEARCH-2026.md) | Refreshed 2025–26 evidence base with live citations. |
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | **The living dashboard** — milestone, progress, perf, top risks. Updated every session. |
| [`ROADMAP.md`](./ROADMAP.md) → [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) | The strategic sequence → the detailed build log. |

## The spokes (by domain)

**Player experience** — [`GAMEPLAY.md`](./GAMEPLAY.md) · [`RETENTION.md`](./RETENTION.md) · [`PROGRESSION.md`](./PROGRESSION.md) · [`PLAYER-PSYCHOLOGY.md`](./PLAYER-PSYCHOLOGY.md) · [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md) · [`UX-GUIDELINES.md`](./UX-GUIDELINES.md) · [`journey.md`](./journey.md)

**Craft** — [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) · [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) · [`PERFORMANCE.md`](./PERFORMANCE.md) · [`../GAME-FEEL.md`](../GAME-FEEL.md)

**Social & competition** — [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md) · [`COMPETITIVE.md`](./COMPETITIVE.md) · [`TOURNAMENTS.md`](./TOURNAMENTS.md)

**Business** — [`ECONOMY.md`](./ECONOMY.md) · [`MONETIZATION.md`](./MONETIZATION.md) · [`SPONSORS.md`](./SPONSORS.md) · [`EDUCATION.md`](./EDUCATION.md)

**Content** — [`WORD-SYSTEM.md`](./WORD-SYSTEM.md) · [`wordlist-review-checklist.md`](./wordlist-review-checklist.md) · [`ai-backdrop-prompts.md`](./ai-backdrop-prompts.md)

**Engineering & trust** — [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md) · [`ANTI-CHEAT.md`](./ANTI-CHEAT.md) · [`ANALYTICS.md`](./ANALYTICS.md) · [`QA-TESTING.md`](./QA-TESTING.md)

**Craft process** — [`MAGIC.md`](./MAGIC.md) (in-the-moment juice) · [`DESIGN_DEBT.md`](./DESIGN_DEBT.md) (polish backlog) · [`PLAYTESTS/`](./PLAYTESTS/) (the player council)

**Instrumentation** — [`TELEMETRY.md`](./TELEMETRY.md) (event schema) → [`ANALYTICS.md`](./ANALYTICS.md) (strategy)

**Decision systems** — [`ADR/`](./ADR/) (permanent architecture decisions) · [`RFC/`](./RFC/) (feature proposals, before code) · [`DECISION-LOG.md`](./DECISION-LOG.md) (running log)

**Governance** — [`RISK-REGISTER.md`](./RISK-REGISTER.md) · [`DECISION-LOG.md`](./DECISION-LOG.md)

## How the brief's requested files map to this system

The founding brief listed ~50 doc names. Rather than 50 stubs, related topics are
consolidated into the docs above (the Bible + constitution absorb the rest). The map:

| Brief file(s) | Lives in |
|---|---|
| VISION, MISSION, CORE_VALUES, DESIGN_PRINCIPLES | [`PRINCIPLES.md`](./PRINCIPLES.md) + Bible §1–3, §20 |
| GAME_DESIGN_BIBLE | [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md) |
| GAMEPLAY, LEVEL_DESIGN, HINT_SYSTEM, BONUS_WORDS | [`GAMEPLAY.md`](./GAMEPLAY.md) + [`journey.md`](./journey.md) |
| RETENTION, STREAK_SYSTEM | [`RETENTION.md`](./RETENTION.md) |
| PLAYER_PSYCHOLOGY | [`PLAYER-PSYCHOLOGY.md`](./PLAYER-PSYCHOLOGY.md) |
| PROGRESSION, PLAYER_PROFILE, ACHIEVEMENTS | [`PROGRESSION.md`](./PROGRESSION.md) |
| SOCIAL, COMMUNITY, CLUBS, LEADERBOARDS | [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md) + [`COMPETITIVE.md`](./COMPETITIVE.md) |
| MULTIPLAYER, TOURNAMENTS | [`COMPETITIVE.md`](./COMPETITIVE.md) + [`TOURNAMENTS.md`](./TOURNAMENTS.md) |
| ECONOMY, MONETIZATION, SPONSORS, CREATOR_PLATFORM | [`ECONOMY.md`](./ECONOMY.md) + [`MONETIZATION.md`](./MONETIZATION.md) + [`SPONSORS.md`](./SPONSORS.md) |
| EDUCATION | [`EDUCATION.md`](./EDUCATION.md) |
| WORD_SYSTEM, CONTENT_PIPELINE | [`WORD-SYSTEM.md`](./WORD-SYSTEM.md) |
| DESIGN_SYSTEM, COLOR_SYSTEM, TYPOGRAPHY, UI/UX, ANIMATION/AUDIO_GUIDE | [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) + [`UX-GUIDELINES.md`](./UX-GUIDELINES.md) + [`../GAME-FEEL.md`](../GAME-FEEL.md) |
| ACCESSIBILITY | [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) |
| PERFORMANCE | [`PERFORMANCE.md`](./PERFORMANCE.md) |
| ARCHITECTURE, DATABASE, API | [`ARCHITECTURE.md`](./ARCHITECTURE.md) + [`../README.md`](../README.md) |
| SECURITY, ANTI_CHEAT | [`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md) + [`ANTI-CHEAT.md`](./ANTI-CHEAT.md) |
| ANALYTICS | [`ANALYTICS.md`](./ANALYTICS.md) |
| TESTING, QA, DEPLOYMENT | [`QA-TESTING.md`](./QA-TESTING.md) + [`../README.md`](../README.md) |
| ROADMAP, CHANGELOG | [`ROADMAP.md`](./ROADMAP.md) + [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) |
| RISK_REGISTER, DECISION_LOG | [`RISK-REGISTER.md`](./RISK-REGISTER.md) + [`DECISION-LOG.md`](./DECISION-LOG.md) |
| AGENTS (operating system) | [`AGENTS-OS.md`](./AGENTS-OS.md) |

If a folded topic ever grows enough to need its own file, split it out and add a
[`DECISION-LOG.md`](./DECISION-LOG.md) entry — grow by need, not by template.

## Rules for keeping this true

1. The Bible and [`PRINCIPLES.md`](./PRINCIPLES.md) win any conflict.
2. Update [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) in the *same commit* as the work.
3. Record significant ship/redesign/cut decisions in [`DECISION-LOG.md`](./DECISION-LOG.md).
4. **🟡 (partial) is more useful than an optimistic ✅.** Status must be honest.
