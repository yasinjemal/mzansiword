# TOURNAMENTS.md

**Owner:** Tournament Systems Designer · **Canonical:** [Bible §9](./GAME-DESIGN-BIBLE.md#9-the-tournament-platform)

The tournament platform is what turns a game into a **platform** — the thing
schools, telcos, retailers, municipalities, and government can *use*. It is also
where the largest B2B revenue lives ([`SPONSORS.md`](./SPONSORS.md)). Build it as a
first-class internal product, not a one-off event tool. It is an aggregation of
async score-attack ([`COMPETITIVE.md`](./COMPETITIVE.md)) — no new core gameplay.

## Formats (proven at scale by chess.com and Scrabble GO)

- **Async score-attack (default):** same puzzle set, best aggregate in a window.
  Latency-free, scales to millions — perfect for province-wide or national events.
- **Swiss (league days, e.g. school-vs-school):** everyone plays every round,
  paired by score, no eliminations. Participation is the point for schools.
- **Single-elimination brackets:** only for dramatic streamed finals, never mass
  rounds (they shed players fast).

## Scheduling & seeding

Weekend tournaments, monthly championships, an annual national final — a recurring
calendar the community organizes its life around (appointment mechanics at the
platform level). Seeding blends ELO + past tournament performance.

## Fairness is existential (treat solvers as an active threat)

Every prize event *will* be attacked by screenshot-to-solver tools. The defense
stack (detailed in [`ANTI-CHEAT.md`](./ANTI-CHEAT.md)):
- **Server-authoritative scoring**, always — the client never decides a
  prize-touching result (the daily game already does this; extend it).
- **Statistical anomaly detection** (chess.com model): inhuman solve times,
  impossible word knowledge; ~85% automated, human review of edge cases.
- **Device fingerprinting** against multi-accounting/collusion in school/province
  events.
- **KYC at prize redemption only**, not signup.
- A **documented, independently-verified fairness policy** — the CPA already
  requires independent draw verification; extend the same rigor to tournaments.

## Prizes

Airtime, data, food/shopping vouchers, tickets, phones, laptops, and the
highest-value, most PR-friendly tier — **scholarships and bursaries**. Funded by
sponsors, never by player payments (Principle 1). Denominations match what the
market wants (R5–R30 airtime/data for mass events; big-ticket for finals).

## Moderation

User-created tournaments and chat need auto-moderation across SA languages,
reporting, mute/shadowban, and human oversight at peak hours — **before** opening
creation to the public (Bible §16).

## Status & sequence

Not started. Phase 4: tournament engine v1 (async score-attack + Swiss) with
anti-cheat wiring. Depends on async mode + anti-cheat layer.

## KPIs

Event participation, completion rate, cheat-catch rate, sponsor-event ROI,
fulfillment reliability (target: 100% auditable).
