# SECURITY-LEGAL.md

**Owner:** Security Engineer + (external) SA Counsel · **Canonical:** [Bible §1](./GAME-DESIGN-BIBLE.md#1-the-one-constraint-that-governs-everything), [§15.5](./GAME-DESIGN-BIBLE.md#15-technical-architecture), [§16](./GAME-DESIGN-BIBLE.md#16-anti-cheat-fairness-moderation--safety)

Two bodies of law govern MzansiWord and both are **launch gates, not paperwork**
(Principle 1, Principle 12).

## 1. CPA section 36 — the promotional-competition spine

MzansiWord gives real airtime/data legally **only** as a promotional competition
under CPA s36 — *not* gambling. The switch between the two is a single word:
**consideration.**

- A promotional competition distributes prizes "by lot or chance" to promote a
  business and exceeds R1.00 in value. **s36(3)(a)** forbids consideration beyond
  transmitting an entry; **Regulation 11(1) caps electronic entry transmission at
  R1.50**, inclusive of all subsequent communication.
- Consideration is *deemed received* if a participant must pay for access, for a
  device to participate, or must buy goods priced above the ordinary price.
- The rules must be lodged and available free; **draws must be independently
  verified** (`npm run verify-draw` reproduces any draw from a crypto seed +
  sorted entrant snapshot).

**What this forbids, always (Principle 1):** any purchase path for coins, hints,
extra lives, tournament entry, or a better puzzle. The moment paying improves win
chance, the draw becomes an illegal lottery.

**The unresolved question (do not ship until counsel confirms):** spending
*earned* coins to enter a draw may count as consideration under a strict reading
([`ECONOMY.md`](./ECONOMY.md) §13.3). Default to a genuinely **free, skill-based
entry path** (solving the daily puzzle enters you at no cost).

**Pilot legal checklist** (from [`../README.md`](../README.md)):
- [ ] Native-speaker review of isiXhosa lists (ships as AI DRAFT).
- [ ] Replace `[PROMOTER NAME]` / `[CONTACT EMAIL]` in `/rules` and `/privacy`.
- [ ] One attorney pass over the CPA s36 competition rules before scaling.
- [ ] Reschedule production puzzles from approved words only.

## 2. POPIA — personal information, especially minors

- Phone numbers are personal information; the schools/learners angle puts
  under-18s in scope. **POPIA requires provable parent/guardian consent for minors,
  and the burden of proof is on us.**
- Build consent capture, data minimization, minor-safe defaults, and retention
  policies into the schema and onboarding **from day one** — retrofitting
  compliance onto a live system with millions of minors' data is the kind of
  mistake that ends companies ([`RISK-REGISTER.md`](./RISK-REGISTER.md) R6).
- Status: `/api/profile/consent`, `profiles` table, and POPIA consent flow exist;
  guardian-consent-for-minors flow must be verified before any school rollout.

## 3. Application security

- Service-role key never reaches the client (`server-only` guard); prize/draw/
  wallet writes go through route handlers only ([`ARCHITECTURE.md`](./ARCHITECTURE.md)).
- Rate-limit OTP per-phone and per-IP (Supabase Auth → Rate Limits).
- `CRON_SECRET` bearer guards the nightly draw cron.
- Anti-cheat and moderation: [`ANTI-CHEAT.md`](./ANTI-CHEAT.md).

## Standing rule

**All legal points here are directional and must be confirmed with South African
counsel before launch.** The promotional-competition/gambling distinction and the
coins-for-entry question are launch gates.
