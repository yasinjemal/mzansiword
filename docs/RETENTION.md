# RETENTION.md

**Owner:** Behavioral Psychologist + Senior Game Designer · **Canonical:** [Bible §5](./GAME-DESIGN-BIBLE.md#5-retention-architecture)

Retention is the whole game — revenue, community, and social proof are all
downstream of DAU that doesn't decay. This doc is the operational spec for the
retention spine; the *why* lives in the Bible, the *evidence* in
[`RESEARCH-2026.md`](./RESEARCH-2026.md).

## Targets

| Metric | MzansiWord target | 2025 industry avg | Top quartile |
|---|---|---|---|
| D1 | **≥ 40%** | ~26–28% | ~31–33% (iOS) |
| D7 | **≥ 20%** | ~8% | ~7–8% |
| D30 | **≥ 10%** | <3% | <3% |

Ambitious but realistic: puzzle is among the strongest genres for long-term
retention, and the streak/league playbook is proven. Instrument these in
[`ANALYTICS.md`](./ANALYTICS.md) from day one.

## The four levers (in priority order)

1. **Unified cross-mode streak (the spine).** One streak per player, advanced by
   *any* qualifying daily action — the daily puzzle **or** a Journey level.
   - 2 free streak **shields** granted to every new player (survive early misses).
   - **Free, effort-based repair** — reclaim a missed day by solving extra
     puzzles in a window. Never a purchase path (Principle 1).
   - **Forgiving early, strict late:** generous in week one; long streaks harder
     to auto-save so they stay meaningful.
   - No-reward **"Perfect Week" gold state** — pride, not currency.
   - **Status (2026-07):** daily-game streak exists (`profiles.current_streak`);
     **Journey completions do not yet feed it** — closing that gap is the current
     Phase-1 priority ([`PHASE-TRACKER.md`](./PHASE-TRACKER.md)).

2. **Weekly League (the social spine).** Duolingo-style promotion/relegation:
   cohorts of ~30, ranked by weekly XP across both modes, Monday-morning SA reset,
   top ~7 up / bottom ~5 down, ~10 tiers Bronze→Diamond, **visible relegation
   zone** (fear of relegation re-engages harder than hope of promotion). Cheap to
   build — a leaderboard with rules, not new gameplay. **Status: not started.**

3. **Session shaping.** The daily loop completes in **3–5 minutes** and ends on a
   clean high: solve → streak ticks → share card offered → tomorrow teased.
   Journey is optional overtime. **Never nag a player who stops.**

4. **Intelligent notifications.** Max two per day: a reminder timed to *this
   player's* historical play time (~23.5h after last session), plus an optional
   "streak at risk" nudge. **Zero guilt-shaming, zero fake urgency** (Principle 2).
   Pre-native: a WhatsApp opt-in reminder.

## The first 7 days decide the next 5 years

Duolingo locks retention in at a 7-day streak and runs most experiments on the
0→7 window. Obsess over week one: forgiving shields, plain-language streak value
("Keep your streak — 3 minutes"), and the 60-second first win (Principle 3).

## Guardrails

- Missions grant coins/XP/cosmetic only — **never advantage** in the prize game.
- Comprehension is retention: an 8-word streak explanation lifted Duolingo DAU by
  10,000+. Teach by playing, in plain localized language.

## Open questions

- Optimal shield count for the SA audience (2 is the Duolingo default — validate).
- WhatsApp reminder deliverability/opt-in rate pre-native wrap.
- League cohort seeding at low early density (see [`COMPETITIVE.md`](./COMPETITIVE.md)).
