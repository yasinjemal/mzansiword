# ANTI-CHEAT.md

**Owner:** Security Engineer + Data Scientist · **Canonical:** [Bible §16](./GAME-DESIGN-BIBLE.md#16-anti-cheat-fairness-moderation--safety), [§9.3](./GAME-DESIGN-BIBLE.md#9-the-tournament-platform)

For a prize-linked, minor-inclusive game these are **existential, not optional**.
Word games face a *specific, severe* threat: screenshot-to-solver tools return
every possible answer in milliseconds, and they are everywhere. Any event with
real prizes *will* be attacked.

## The defense stack

- **Server-authoritative scoring, always.** The client never decides a
  prize-touching result. The daily game already does this correctly
  ([`ARCHITECTURE.md`](./ARCHITECTURE.md)) — extend it to every tournament.
- **Statistical anomaly detection** (chess.com model): flag inhuman solve times
  and impossible word-knowledge patterns; screen new accounts harder; ~85%
  automated with human review of edge cases.
- **Sub-N-second solve auto-exclusion** — already live in the daily draw
  (sub-10s solves auto-excluded; visible in `/admin/flagged`).
- **Device fingerprinting** against multi-accounting and collusion in
  school/province events. `lib/fingerprint.ts` is seeded but **not yet wired** to
  tournament scoring — do this before the first public prize tournament.
- **KYC at prize redemption only**, not signup — minimize friction, gate at the money.
- **Independently-verified fairness policy** — the CPA already requires independent
  draw verification (`verify-draw` reproduces any past draw from its seed);
  publish and extend the same rigor to tournaments. Sponsor and school trust
  depends on this being real and auditable.

## Moderation (ship before opening any UGC/chat)

Auto-moderation across SA languages (English, Afrikaans, isiZulu, isiXhosa, …) for
chat, usernames, and any UGC; player reporting; mute/shadowban; human oversight at
peak evening hours. Required *before* opening public tournament creation or clubs
with chat ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md), [`TOURNAMENTS.md`](./TOURNAMENTS.md)).

## Child safety (non-negotiable given the schools strategy)

Provable guardian consent for under-18s, age-appropriate defaults, **no open chat
with strangers for minors**, data minimization ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)).

## Status & KPIs

Foundational anti-cheat (server scoring, sub-10s exclusion, auditable draws)
shipped for the daily game; fingerprint + anomaly detection pending for
tournaments. KPIs: cheat-catch rate, false-positive rate (must stay low — banning
honest players is its own harm), multi-account detection, breaches (target: 0).
