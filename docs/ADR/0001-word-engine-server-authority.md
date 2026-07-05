# 0001 — Word engine & server-authority split

- **Status:** Accepted
- **Date:** 2026-07-06 (documenting a decision already implemented)
- **Deciders:** Backend Architect, Security Engineer
- **Relates to:** [`PRINCIPLES.md`](../PRINCIPLES.md) Principle 8; [Bible §15.2](../GAME-DESIGN-BIBLE.md#15-technical-architecture); [`ARCHITECTURE.md`](../ARCHITECTURE.md)

## Context

MzansiWord gives real airtime prizes, so any result that touches a prize is a
cheating and legal target ([`ANTI-CHEAT.md`](../ANTI-CHEAT.md)). Word games are
uniquely exposed: screenshot-to-solver tools return every answer in milliseconds.
At the same time, Journey mode has no prize and must feel instant on a metered,
flaky connection. A single authority model can't serve both well.

## Decision

**Split authority by money-proximity.**
- **Prize game, draws, wallets, tournament scoring → server-authoritative.** The
  day's answer lives in a table with **no RLS policy**, so client keys physically
  cannot read it; scoring happens in route handlers with the service-role key
  (`server-only`). Draws are seed-reproducible (`npm run verify-draw`).
- **Journey → client-authoritative.** Instant offline feedback; the server is a
  clamped ledger only (`journey/economy.ts`).

## Consequences

- **Easier:** provable fairness for prizes (CPA independent-verification
  requirement is satisfied by design); instant, offline-tolerant Journey play;
  cheating Journey wins nothing, so we don't waste effort defending it.
- **Harder:** every new prize-linked system must be built server-authoritative
  from the start — no shortcuts. This is a deliberate, permanent tax on prize
  features and is the correct trade.

## Alternatives considered

- **All-client** — rejected: uncheatable prize integrity is impossible; illegal-
  lottery / wrong-winner risk.
- **All-server (incl. Journey)** — rejected: adds latency and offline breakage to a
  mode where cheating gains nothing; pure cost, no benefit.
