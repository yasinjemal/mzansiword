# RISK-REGISTER.md

**Owner:** Product Strategist · **Canonical:** [Bible §18](./GAME-DESIGN-BIBLE.md#18-where-this-plan-is-most-likely-to-fail-read-this-twice)

A plan that only sells the upside is dishonest. Risks are ranked by severity ×
likelihood. Each has an owner and a mitigation that is a *live commitment*, not a
hope. Review this list at the start of every phase.

| # | Risk | Severity | Owner | Mitigation | Status |
|---|---|---|---|---|---|
| **R1** | **Thin isiXhosa content undermines the entire national/educational positioning.** Present *today* (~15 levels). | Critical | Learning Scientist | Resource native-speaker wordlist expansion **now** as critical-path work, not "later." No feature outranks it (Principle 9, [`WORD-SYSTEM.md`](./WORD-SYSTEM.md)). | 🟡 Open — top priority |
| **R2** | **The prize-draw legal structure is one attorney's opinion from existential trouble.** The coins-for-tickets = consideration question is unresolved. | Critical | Security + Counsel | SA counsel review **before** shipping any coin→ticket path; keep free, skill-based entry as default; treat legal review as a launch gate ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md), [`ECONOMY.md`](./ECONOMY.md)). | 🟡 Open — launch gate |
| **R3** | **Monetization may not cover prizes + infra at low SA ARPU** (~$1–5 eCPM, ~1% sub conversion). | High | Monetization + Sponsor | The business does **not** rely on player ARPU covering prizes — **sponsors/telcos fund prizes**; player monetization funds ops. The telco deal is the load-bearing wall; pursue first and hardest ([`SPONSORS.md`](./SPONSORS.md)). If deals slip, shrink the prize element to what ads/subs bear. | 🟡 Open |
| **R4** | **Feature sprawl kills small teams** — ~15 multiplayer modes, many currencies, multiple platforms. | High | Exec Game Director | Ruthless sequencing off async score-attack (Principle 10, [`COMPETITIVE.md`](./COMPETITIVE.md), [`ROADMAP.md`](./ROADMAP.md)); build one thing well and reuse it. | 🟢 Controlled by design |
| **R5** | **Empty-room problem** in leagues/clubs/tournaments at low density. | Med | Multiplayer Designer | Launch social features only when DAU density supports them; always fall back to async/score-attack (works at any count). | 🟢 Controlled by sequencing |
| **R6** | **Child-safety / POPIA failure at scale** — millions of minors' data retrofitted. | Critical | Security | Build consent, minimization, and minor-safe defaults into schema + onboarding from day one ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md), [`ANTI-CHEAT.md`](./ANTI-CHEAT.md)). | 🟡 Open — verify before school rollout |
| **R7** | **Cheating on prize events** via screenshot-to-solver tools. | High | Security | Server-authoritative scoring, anomaly detection, fingerprinting, sub-N-second exclusion, auditable fairness policy ([`ANTI-CHEAT.md`](./ANTI-CHEAT.md)). | 🟡 Foundation shipped; tournament layer pending |
| **R8** | **Performance regression** breaks playability on low-end Android at SA data prices. | Med | Performance Eng | ≤10 KB/feature budget, measured on real devices; standing QA gate ([`PERFORMANCE.md`](./PERFORMANCE.md)). | 🟢 Controlled by discipline |
| **R9** | **Watch item: 2027 PBO zero-rating obligation** — opportunity *and* dependency. If the education tier qualifies, zero-rating may become an entitlement; if it doesn't, a planned advantage evaporates. | Med (opportunity) | Sponsor + Counsel | Investigate qualification with counsel; fold into telco talks and education roadmap ([`RESEARCH-2026.md`](./RESEARCH-2026.md) §7, [`DECISION-LOG.md`](./DECISION-LOG.md)). | 🟡 Open — investigate |

## Deliberately deferred/cut (not risks — choices)

The Rive mascot, a full social feed/follower graph, the fifteen multiplayer modes
as separate builds, coins-purchasable-anything, and year-one national
championships are deferred or cut. Rationale in
[`DECISION-LOG.md`](./DECISION-LOG.md) and Bible §18.
