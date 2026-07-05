# COMPETITIVE.md

**Owner:** Multiplayer Systems Designer + Esports Consultant · **Canonical:** [Bible §8](./GAME-DESIGN-BIBLE.md#8-competitive-systems--multiplayer--what-launches-first)

The founding brief lists ~15 multiplayer modes. **Building all fifteen would be a
strategic error** — it fragments a small player base across empty queues and needs
density we won't have on day one. Sequence ruthlessly (Principle 10).

## Async-first is non-negotiable for SA connectivity

Words With Friends built an empire on asynchronous play (up to 40 concurrent
games, push when it's your turn). A dropped signal or a shared, data-metered phone
must never break a match. **Real-time is an opt-in luxury, never the backbone.**

## The launch sequence (each step reuses the last step's tech)

1. **Async score-attack (the keystone).** Everyone plays the *same* puzzle; best
   score/time wins. No matchmaking, no latency, trivially server-scored, scales to
   unlimited players. **Leagues, clubs, school-vs-school, and tournaments are all
   aggregations of this.** Build this one thing well.
2. **Friend challenges** — "beat my score" via WhatsApp ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)).
3. **Weekly League** (+1 month) — promotion/relegation, the daily-return engine
   ([`RETENTION.md`](./RETENTION.md)).
4. **Club races** (+2–3 months) — team-vs-team via aggregated async play.
5. **Ranked ELO/MMR** (month 4–6) — persistent rating with a *widening* search
   window (Clash Royale widens ±1 every 5s) so nobody waits on a thin base.
6. **Real-time blitz duels** (month 6+, opt-in) — only once density supports it.
7. **School-vs-school / province-vs-province** (month 6–12) — async + clubs, no
   new core tech.
8. **Spectator/replay for finals** (year 2) — shareable events + sponsor surface.

Casual mode, private rooms, and championships are *configurations of the above*,
not separate builds — the point of sequencing this way.

## The empty-room risk

Leagues/clubs/tournaments are miserable with no players. Launch each only when DAU
density supports it, and always fall back to async score-attack (works at any
count). See [`RISK-REGISTER.md`](./RISK-REGISTER.md) R5.

## Fairness is existential

Word games face screenshot-to-solver tools returning every answer in milliseconds.
Any prize event *will* be attacked. Server-authoritative scoring, always. See
[`ANTI-CHEAT.md`](./ANTI-CHEAT.md) and [`TOURNAMENTS.md`](./TOURNAMENTS.md).

## Status (2026-07)

Nothing competitive shipped yet; async score-attack is the Phase-3 keystone.
`lib/fingerprint.ts` seeded for later anti-cheat wiring.

## KPIs

Match/event fill rate, league retention lift, club participation, ranked ladder
engagement, wait-time at low density (target: none, via async).
