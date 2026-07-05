# ECONOMY.md

**Owner:** Economy Designer · **Canonical:** [Bible §13](./GAME-DESIGN-BIBLE.md#13-the-economy)

Because coins **cannot be bought** (Principle 1), MzansiWord's economy is simpler
and safer than a normal F2P economy — the classic inflationary death spiral is
*structurally impossible* because you can't over-drain a currency players can't
buy. But discipline still matters: a flood of free coins makes rewards worthless.

## Currencies (keep them few)

- **Coins** — soft currency, **earned only**. Faucets: puzzle completion, bonus
  words, daily gift, *capped* rewarded-ad watches. Sinks: hints, cosmetics, entry
  into *free* competitions.
- **Gems / premium** — earned through achievement or granted with a subscription.
  **Never sold à la carte for advantage.** Cosmetics and convenience only.
- **Tournament tokens / raffle tickets** — earned by playing. Flagship sink.

## Inflation control: every faucet needs a sink

- **The prize draw is the perfect sink** — earned coins/tickets spent to enter are
  *destroyed* and converted into engagement toward real airtime prizes that never
  re-enter the supply. The retention mechanic *is* the economy's balancer.
- Seasonal resets, time-limited event tokens, cosmetic sinks mop up hoards.
- If hoarding appears, a gentle idle-coin decay ("wealth tax") is the fallback —
  unlikely to be needed given capped faucets.

## ⚠️ The legal nuance on tickets (launch gate)

Spending *earned* coins to enter a prize draw may, under a strict reading, count
as "consideration" — which re-triggers gambling law (CPA s36; see
[`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md)). **The coins→ticket path must not ship
until a South African attorney confirms the structure.** The safe default, already
used: a genuinely **free entry path** (solving the daily puzzle enters the draw at
no cost) and **skill-based** winner framing. When in doubt, entry is free and
earned by skill.

## Content is the deepest economy

The wordlists are the real economy of a word game. **isiXhosa content depth is the
top economic priority** (Principle 9, [`WORD-SYSTEM.md`](./WORD-SYSTEM.md)). No
amount of coin tuning matters if the flagship language runs out of levels.

Code: `journey/economy.ts` is a server-clamped ledger for Journey (client-
authoritative, no prize). Keep prize-linked balances server-authoritative.

## KPIs

Coin faucet vs. sink ratio, median coin balance (watch for hoarding), hint
spend rate, cosmetic conversion, rewarded-ad watch rate vs. cap.
