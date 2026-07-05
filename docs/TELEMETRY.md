# TELEMETRY.md — The Event Schema

**Owner:** Data Scientist + Backend Architect · **Canonical strategy:** [`ANALYTICS.md`](./ANALYTICS.md)

> **Boundary:** [`ANALYTICS.md`](./ANALYTICS.md) is the *strategy* — which metrics
> matter, targets, and the ethical guardrails. **This file is the concrete event
> contract** — the named events, their properties, and the rules for emitting
> them. Never build blind: if a feature ships without its events, we can't tell if
> it worked ([`AGENTS-OS.md`](./AGENTS-OS.md) pipeline step 15).

## Where events go

Existing pipe: client/server → `/api/track` → `track-event.ts` → `events` table
(migration 0003). This is the sink today; it can later feed PostHog or Supabase
Analytics without changing call sites if the event names stay stable.

## Naming & property rules

- **`object_action`**, snake_case, past tense: `level_completed`, `hint_used`.
- Every event carries: `event`, `ts` (server time), `session_id`, `player_id`
  (or `guest_id`), `mode` (`daily` | `journey`), and `app_version`.
- **Additive only** — never repurpose an event name; add a new one and deprecate
  the old (mirrors the [ADR](./ADR/) immutability idea for schema).

## The core event catalog

| Event | Key properties | Why we care |
|---|---|---|
| `session_started` | source (`whatsapp`/`direct`/`return`) | funnel top, first-touch attribution |
| `first_win` | seconds_to_win | the 60-second rule ([`UX-GUIDELINES.md`](./UX-GUIDELINES.md)) |
| `daily_puzzle_started` / `_completed` | attempts, seconds, solved | daily solve rate, appointment health |
| `level_started` / `level_completed` | track, level, seconds | Journey depth & completion |
| `hint_used` | context, coins_spent | difficulty tuning, coin sink |
| `bonus_word_found` | count_in_level | delight + coin faucet |
| `word_rejected` | reason (`not_in_list`/`wrong`) | wordlist gaps ([`WORD-SYSTEM.md`](./WORD-SYSTEM.md)) |
| `coins_earned` / `coins_spent` | amount, source/sink | economy balance ([`ECONOMY.md`](./ECONOMY.md)) |
| `streak_advanced` | length, mode | the retention spine |
| `streak_shield_used` / `streak_repaired` | — | shield/repair tuning |
| `streak_lost` | length_at_loss | churn early-warning |
| `share_card_shown` / `share_tapped` | moment/type | virality ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)) |
| `signature_moment_fired` | moment_id | affection layer ([`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md)) |
| `friend_invited` / `referral_activated` | — | K-factor |
| `tournament_joined` / `_completed` | event_id, score | competitive engagement |
| `school_joined` / `club_joined` | id | group identity |
| `prize_claimed` / `prize_paid` | — | fulfillment reliability |
| `ad_offered` / `ad_completed` | placement, reward | rewarded-ad economics ([`MONETIZATION.md`](./MONETIZATION.md)) |
| `subscription_started` / `_cancelled` | plan | Plus conversion/churn |
| `perf_sample` | route, first_load_kb, fps | live perf budget ([`PERFORMANCE.md`](./PERFORMANCE.md)) |

## Ethical & legal guardrails (hard rules)

- **POPIA / minors:** data minimization — never log message content, precise
  location, or anything not needed for the metric; extra caution for under-18s
  ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)).
- **No dark-pattern optimization:** we instrument `session_length` to *protect* the
  3–5 min healthy loop, **not** to inflate it (Principle 2, [`ANALYTICS.md`](./ANALYTICS.md)).
- **Pre-register:** for any experiment, declare the event + success metric before
  the test ([`DECISION-LOG.md`](./DECISION-LOG.md)).

## Definition of done for a feature

Its events exist in this catalog, fire correctly (verified in `events`), and a
dashboard in [`ANALYTICS.md`](./ANALYTICS.md) can read them. No events = not done.
