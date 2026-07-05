# ARCHITECTURE.md

**Owner:** Backend + Frontend Architect · **Canonical:** [Bible §15](./GAME-DESIGN-BIBLE.md#15-technical-architecture)

The technical philosophy is already correct and should be **defended against
feature pressure, not rewritten** (Principle 4). The constraints in
[`../GAME-FEEL.md`](../GAME-FEEL.md) *are* the strategy.

## The stack

Next.js (App Router) PWA + Supabase (Postgres, RLS, phone-OTP auth) + Vercel with
a nightly cron. Sound, cheap, scalable for this game. The growth loop is the
instant-play WhatsApp link — a 30 MB native bundle would kill it. **No Unity, no
Unreal, no three.js exports, no heavy engines.**

## The authority split (the template for every new system)

**Server-authoritative where money lives; client-authoritative where it doesn't.**

- **Prize game, draws, wallets, tournament scoring → server-authoritative.** The
  day's answer lives in the `puzzles`/`words_answers` table with **no RLS policy**
  — client keys physically cannot read it. Scoring happens in route handlers with
  the service-role key (`src/lib/supabase/admin.ts`, guarded by `server-only`).
  Draws are seed-auditable and reproducible (`npm run verify-draw`). Extend this
  exact rigor to every prize-linked tournament ([`ANTI-CHEAT.md`](./ANTI-CHEAT.md)).
- **Journey → client-authoritative by design.** No prize attached, so cheating
  wins nothing; instant offline feedback matters more. The server is a clamped
  ledger only (`journey/economy.ts`). **Do not "fix" this with pointless server
  validation.**

## Key routes (shipped)

`/api/guess`, `/api/puzzle/today`, `/api/play/state`, `/api/cron/daily-draw`,
`/api/prize/claim`, `/api/signature`, `/api/journey/*`, `/api/profile/*`,
`/api/track`, `/api/admin/action`. Admin pages gated to `ADMIN_PHONES` (others 404).

## What to add, in order

1. **Unified profile + streak service** — foundational new backend work
   ([`RETENTION.md`](./RETENTION.md), [`PROGRESSION.md`](./PROGRESSION.md)).
2. **League/leaderboard service** — cohort assignment, weekly reset,
   promotion/relegation. Mostly a scheduled job + queries.
3. **Async tournament engine** — score aggregation over a puzzle set in a window;
   reuses daily-game scoring. Keystone for [`COMPETITIVE.md`](./COMPETITIVE.md).
4. **Anti-cheat/fingerprinting layer** — before any public prize tournament.
5. **Capacitor native wrap (last)** — Play Store listing, native haptics, push,
   with zero rewrite. Only after the PWA + pilot checklist are done.

## Offline & data-frugality as features

Journey levels are offline-playable once loaded; extend cache-first everywhere
non-prize. Every KB saved is a player retained at SA data prices
([`PERFORMANCE.md`](./PERFORMANCE.md)).

## POPIA / data architecture

Phone numbers are personal information; under-18s require provable guardian
consent (burden on us). Build consent capture, data minimization, and retention
policies into the schema and onboarding **now**, not retrofitted
([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)). Migrations live in
`supabase/migrations/` (0001 init … 0003 events, 0004 signature moments).

## KPIs

p95 API latency, error rate, cache hit rate, cold-start TTI on low-end Android.
