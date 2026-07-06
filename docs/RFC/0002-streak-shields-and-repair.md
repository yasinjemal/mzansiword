# RFC-0002 — Streak shields & free effort-based repair

- **Status:** Draft — ready to hand to the IDE. Builds on [RFC-0001](./0001-unified-cross-mode-streak.md) (unified streak, shipped Slice A).
- **Author / Deciders:** Behavioral Psychologist, Senior Game Designer, Backend Architect, Security Engineer
- **Date:** 2026-07-06

## Problem

The unified streak (RFC-0001) is now the retention spine — but it is **brittle in
exactly the window that matters most**. Retention "locks in" at a 7-day streak, yet
today a single missed day resets a new player from, say, 4 → 1, right when the habit
is most fragile. We have no safety net for the 0→7-day window and no way to recover
a lapse. This is the difference between a habit that survives week one and one that
dies on the first busy day.

## Named emotion (Principle 6)

*"I slipped, but the game had my back — I didn't lose everything."* Relief and a
second chance, not punishment. (And for the earned repair: *"I earned my streak
back — it still counts."*)

## Research

- Giving new users **2 streak freezes** was one of Duolingo's top retention wins;
  a **free, effort-based repair** ("earn it back") beat *selling* repairs
  ([`../RESEARCH-2026.md`](../RESEARCH-2026.md) §3, [Bible §3.2](../GAME-DESIGN-BIBLE.md#3-what-the-best-games-actually-teach-us-principles-not-features)).
- **Forgiving early, strict late:** generous in week one; long streaks stay
  meaningful because they're harder to auto-save ([`../RETENTION.md`](../RETENTION.md) §5.1).
- Selling a streak-save is **illegal here anyway** (Principle 1, CPA s36) — the
  ethical design is the only legal one, which is convenient.

## Proposal

Two mechanisms, deliberately staged. **Shields are passive** (a safety net that
fires automatically); **repair is active** (the player earns a lapse back).

### B1 — Streak shields (ship first)

- **Grant 2 shields to every new player** (and to existing pre-launch players via a
  one-time backfill in the migration).
- **Auto-consume on a gap:** at the next qualifying action, if the streak *would*
  reset because of a **one-day** gap and the player holds ≥1 shield, spend one
  shield and **continue** the streak instead of resetting.
- **Cap holding at 2** so shields stay scarce and meaningful. Earn more slowly later
  (e.g. +1 per "Perfect Week" gold state, capped) — but launch with grant-only.
- **Never sold, ever.** Grant/earn only (Principle 1).
- Gaps larger than the shields held still reset — shields cover single missed days,
  not long absences ("forgiving early, strict late").

### B2 — Free effort-based repair (ship after B1 proves out)

- When a streak *does* reset, remember the pre-lapse length and open a short repair
  window (e.g. 48h). Within it, the player **earns the streak back by completing N
  extra qualifying actions** (e.g. 2–3 puzzles/levels) — no purchase path.
- On success, restore the pre-lapse streak (minus nothing, or minus the missed day —
  decide during B2). On expiry, the reset stands.

### Schema (migration `0005_streak_shields.sql`)

```
alter table profiles
  add column streak_shields    smallint not null default 2,   -- B1
  add column pre_lapse_streak  int      not null default 0,   -- B2
  add column lapse_date        date,                          -- B2
  add column repair_progress   smallint not null default 0;   -- B2
-- one-time backfill for existing players:
update profiles set streak_shields = 2 where streak_shields = 0;
```

The **atomic `update_streak_on_solve` function is extended** to be shield-aware in
the gap branch (single SQL UPDATE preserved, so concurrency safety from RFC-0001
holds). The pure spec in `src/lib/streak/streak.ts` gets a matching
`nextStreak`-with-shields and new tests so TS and SQL stay identical.

## Cost

- **Backend:** one migration + an extension to the atomic function + grant-on-signup
  (the profile-insert trigger already exists in migration 0001). B2 adds the repair
  window logic. Moderate, not large.
- **Client:** a shield indicator near the flame; a "streak saved!" moment
  ([`../MAGIC.md`](../MAGIC.md)); for B2, a repair prompt. Small KB.
- **Maintenance:** the streak function grows more branches — the main ongoing cost.

## Accessibility

Shield/repair state must be legible without colour and announced to screen readers;
the "streak saved" celebration needs a `prefers-reduced-motion` path
([`../ACCESSIBILITY.md`](../ACCESSIBILITY.md)).

## Legal / safety

Shields and repair are **free, earned/granted, never sold** (Principle 1). No prize
advantage. POPIA-neutral (no new personal data). No dark-pattern framing — relief,
never guilt (Principle 2).

## Alternatives

- **A. Shields only, no repair** — viable and simpler; repair may be unnecessary if
  2 shields already cover most week-one lapses. (This is why B2 is staged behind
  data from B1.)
- **B. Repair only, no shields** — rejected: passive protection is what saved
  Duolingo's newbies; asking a lapsed player to grind back is worse for the exact
  fragile user we're protecting.
- **C. Longer auto-save for everyone** — rejected: erodes the meaning of long
  streaks ("strict late").

## Case against (the honest ≥20%)

This adds real branching to the **retention spine** — the one system whose bugs are
most damaging — for a benefit that RFC-0001 already partly delivers (the streak is
now unified, so it's *easier* to keep alive across two modes; some week-one lapses
already disappear). Concretely:

1. **Complexity tax on the highest-stakes code.** Every branch in
   `update_streak_on_solve` is a place a streak can silently corrupt. B2 in
   particular (pre-lapse memory, windows, partial restore) is a lot of state for a
   feature most players may never touch.
2. **Shields can mask a churn signal.** A player whose streak is auto-saved looks
   engaged in the data while actually drifting — we could hide the very early-churn
   signal we most need to see. Mitigation: log `streak_shield_used` distinctly
   ([`../TELEMETRY.md`](../TELEMETRY.md)) and watch shield-users' D30 separately.
3. **Repair can feel like a grind / a mild dark pattern** ("do chores to get your
   number back") — the opposite of the intended relief. If B2 ever feels coercive,
   it fails Principle 2 and should be cut, not tuned.
4. **Untested schema change to the spine.** Like Slice A, this can't be verified in
   the doc sandbox — it must be built and tested in the IDE with a real DB
   (`npm test` + `supabase db push` on a branch), or we risk shipping a corrupt
   streak to every player.

**Honest recommendation from this section:** ship **B1 (shields) alone first**,
instrument it, and **only build B2 (repair) if the data shows meaningful week-one
lapses that 2 shields don't catch.** Don't build both up front. If B1 already lifts
D7 to target, B2 may never be worth its complexity.

## Decision

Proceed with **B1 (shields)**; hold **B2 (repair)** pending B1 data. **Judged by:**
D7 lift and 0→7-day survival rate for new players, with `streak_shield_used` and
shield-cohort D30 as guardrails against masking churn ([`../ANALYTICS.md`](../ANALYTICS.md)).
Build and verify in the IDE (real `npm test` + `supabase db push`), not blind.

## Hand-off checklist for the IDE

- [x] Write `supabase/migrations/0005_streak_shields.sql` (B1 column + backfill + shield-aware function). *B2 columns deliberately deferred — a held feature earns no unused schema.*
- [x] Extend `src/lib/streak/streak.ts` with shield logic + tests; keep TS == SQL. *(shields in `StreakState`; `daysBetween` in `time.ts`; +6 shield tests.)*
- [x] Grant 2 shields on signup. *Satisfied by the `streak_shields` column default (`handle_new_user` inserts inherit it) — no trigger change; existing players backfilled by `ADD COLUMN … DEFAULT 2`.*
- [x] Add shield indicator + "streak saved" moment (reduced-motion path). *`ShieldPips` (me page + daily `ResultPanel`); "Streak saved!" line with `role="status"`; reuses reduced-motion-guarded animation classes. Journey shows the persistent count + fires telemetry; a Journey-specific celebration card is deferred (small-KB scope).* 
- [x] Add `streak_shield_used` telemetry. *Server-side `logEvent` from both `/api/guess` and `/api/journey/complete`, `mode`-tagged.*
- [ ] `npm test` && `npm run lint` && `npm run build` && `npx supabase db push`, then flip PHASE-TRACKER/PROJECT_STATUS to ✅. *Run locally — the sandbox can't execute the Windows-native toolchain or reach the DB.*
