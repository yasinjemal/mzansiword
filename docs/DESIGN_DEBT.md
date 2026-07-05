# DESIGN_DEBT.md — Known Rough Edges

**Owner:** UI Designer + Senior Game Designer · Append/triage as noticed.

Like technical debt, but for *feel and clarity*. This is the honest running list of
things that work but aren't yet good enough — so they get fixed deliberately, one by
one, instead of being forgotten or shipped as "fine." Logging debt here is a sign of
craft, not failure (Principle: 🟡 honesty > optimistic ✅).

**Boundary:** functional bugs go to the issue tracker / [`QA-TESTING.md`](./QA-TESTING.md);
*this* file is for polish, consistency, and clarity debt that no test would catch.

## How to use

Add a row when you notice a rough edge. Triage by **player impact × effort**. Clear
items by linking the RFC/commit that fixed them (move to "Resolved"). Review the top
of the list each polish pass.

## Open

| # | Debt | Where | Impact | Effort | Notes |
|---|---|---|---|---|---|
| D1 | Animation timing/easing inconsistent across surfaces | daily vs. Journey vs. cards | Med | Med | Standardize spring params in `spring.ts`; one motion language ([`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md)) |
| D2 | Reward popups feel generic / same-y | end-of-level, coins | Med | Low | Differentiate by magnitude; tie to [`MAGIC.md`](./MAGIC.md) tiers |
| D3 | Chapter transitions abrupt | `JourneyMap` → `ChapterScene` | Med | Med | Needs a "the map opens" beat |
| D4 | Coin reward values not yet tuned | `journey/economy.ts` | Med | Low | Faucet/sink pass once telemetry lands ([`ECONOMY.md`](./ECONOMY.md), [`TELEMETRY.md`](./TELEMETRY.md)) |
| D5 | Letter-wheel sensitivity / hit areas | `LetterWheel` | High | Med | Drag threshold + forgiving targets ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md)) |
| D6 | Hint button placement risks mis-taps | Journey HUD | Med | Low | Move out of thumb-swipe path (one-thumb reach) |
| D7 | Colour-blind distinctness of tile states unverified | `Board`/`Keyboard` | High | Low | Add non-colour cue; verify with simulator ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md)) |
| D8 | Streak value not explained in plain words | onboarding | High | Low | 8-word explanation (Duolingo lifted DAU 10k+); comprehension = retention |

> The above are seeded from a design read of the shipped components and the Bible's
> known gaps; confirm each against the live build and against real playtests
> ([`PLAYTESTS/`](./PLAYTESTS/)) before scheduling.

## Resolved

_(none yet — link the fix when an item graduates here)_
