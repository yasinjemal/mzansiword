# AGENTS-OS.md — The MzansiWord Operating System

**Version 1.0 · 2026-07-06**

> Not to be confused with the repo-root [`AGENTS.md`](../AGENTS.md), which is a
> Next.js coding rule. This document is the *human/AI org chart*: the roles that
> must sign off on work, the pipeline every feature travels, and the gates it
> must clear. On a small team one person wears several of these hats — the value
> is the **checklist of perspectives**, not the headcount.

Everything here is subordinate to [`PRINCIPLES.md`](./PRINCIPLES.md). Where a role
below has an opinion that conflicts with the constitution, the constitution wins.

---

## How to use this

For any non-trivial feature, walk the **Feature Pipeline** below. At each stage,
adopt the relevant roles and let them *challenge each other* — the studio culture
is "never agree with weak ideas." A feature that can't survive its own review
board isn't ready. Record the outcome (ship / redesign / cut) in
[`DECISION-LOG.md`](./DECISION-LOG.md).

---

## The Feature Pipeline (no step skipped)

1. **Research** — what does the evidence say? ([`RESEARCH-2026.md`](./RESEARCH-2026.md))
2. **Competitive analysis** — who solved this, and what's the *principle* (not the feature) to steal?
3. **Player psychology** — which drive does this serve (loss aversion, mastery, belonging, anticipation)?
4. **Design principles check** — does it obey [`PRINCIPLES.md`](./PRINCIPLES.md) and name its emotion?
5. **User journey** — where does it sit in the first-minute → habit → identity arc? ([`journey.md`](./journey.md))
6. **Wireframes / interaction** — one screen, one primary question. ([`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md))
7. **Edge cases** — offline, dropped signal, guest vs. authed, minor vs. adult, empty state.
8. **Accessibility** — reduced motion, colour-blind states, one-thumb reach, plain language. ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md))
9. **Performance analysis** — KB budget, FPS on low-end Android, cache behaviour. ([`PERFORMANCE.md`](./PERFORMANCE.md))
10. **Security & legal review** — CPA/POPIA/anti-cheat implications. ([`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md), [`ANTI-CHEAT.md`](./ANTI-CHEAT.md))
11. **Technical architecture** — server vs. client authority, data model. ([`ARCHITECTURE.md`](./ARCHITECTURE.md))
12. **Data model & API** — schema, RLS, route handlers.
13. **Testing strategy** — unit (engine/RNG/time), integration, play-test.
14. **QA checklist** — [`QA-TESTING.md`](./QA-TESTING.md).
15. **Metrics** — what instruments success/failure before rollout? ([`ANALYTICS.md`](./ANALYTICS.md))
16. **Rollout** — flag, cohort, monitor.
17. **Post-launch success metrics** — did retention/learning/revenue actually move?

Only after 1–17 does production code get written. Non-trivial features capture
steps 1–11 in a written [RFC](./RFC/) first — whose **"Case against" section must
carry ≥20% of the weight** (the self-critique rule in [`../CLAUDE.md`](../CLAUDE.md)).
Update [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) and
[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) in the *same commit* as the work.

---

## The roster

Each agent has a **mission**, the **documents it owns** (is accountable for
keeping true) and **reads** (must respect), and an **approval gate** (nothing in
its domain ships without its sign-off). KPIs are the numbers that agent is judged
on.

### Direction & product

| Agent | Mission | Owns | Reads | Approval gate | KPIs |
|---|---|---|---|---|---|
| **Creative Director** | Protect the feeling and the SA soul of the game | [`PRINCIPLES.md`](./PRINCIPLES.md), [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md) | all | Any feature's *named emotion* | Share rate, "moment" fire rate, brand sentiment |
| **Executive Game Director** | Own the roadmap and the ruthless sequencing | [`ROADMAP.md`](./ROADMAP.md), [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) | all | Scope of every phase | On-plan delivery, DAU trajectory |
| **Product Strategist** | Keep bets tied to retention/learning/revenue | [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md), [`DECISION-LOG.md`](./DECISION-LOG.md) | all | Prioritisation calls | Feature ROI, hypothesis hit-rate |

### Design & experience

| Agent | Mission | Owns | Reads | Approval gate | KPIs |
|---|---|---|---|---|---|
| **Senior Game Designer** | The core loop and progression feel | [`GAMEPLAY.md`](./GAMEPLAY.md), [`PROGRESSION.md`](./PROGRESSION.md) | Bible §4–6 | Loop changes | Session length (3–5 min), D1 |
| **Behavioral Psychologist** | Ethical use of motivation; no dark patterns | [`PLAYER-PSYCHOLOGY.md`](./PLAYER-PSYCHOLOGY.md) | Bible §3 | Any reward/notification design | Streak retention, complaint rate |
| **Learning Scientist** | Real, measurable literacy gain | [`EDUCATION.md`](./EDUCATION.md), [`WORD-SYSTEM.md`](./WORD-SYSTEM.md) | CAPS, PIRLS | Vocabulary/mastery model | Words learned, reading-level lift |
| **UX Researcher** | Validate with real low-end users | [`UX-GUIDELINES.md`](./UX-GUIDELINES.md) | journey | First-minute audit | 60-sec-to-win pass rate |
| **UI / Art Director / Motion / Sound** | Premium, intentional, cheap-to-run craft | [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md), [`GAME-FEEL.md`](../GAME-FEEL.md) | perf budget | Visual/audio/motion changes | FPS, KB, reduced-motion parity |
| **Accessibility Expert** | Inclusion as requirement | [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) | all UI | Every UI surface | WCAG checks, colour-blind pass |

### Systems & economy

| Agent | Mission | Owns | Reads | Approval gate | KPIs |
|---|---|---|---|---|---|
| **Economy Designer** | Balance faucets/sinks; keep coins unbuyable | [`ECONOMY.md`](./ECONOMY.md) | Bible §13 | Any currency change | Coin inflation, sink health |
| **Monetization Designer** | Revenue without selling power | [`MONETIZATION.md`](./MONETIZATION.md) | Bible §14 | Any paid surface | ARPDAU, sub conversion, ad opt-in |
| **Multiplayer / Tournament / Esports** | Density-aware competitive layer | [`COMPETITIVE.md`](./COMPETITIVE.md), [`TOURNAMENTS.md`](./TOURNAMENTS.md) | Bible §8–9 | New modes | Match fill, event participation |
| **Community Manager** | Clubs, moderation, live ops | [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md) | Bible §7 | Community features | K-factor, club activity |
| **Education / Sponsor Consultant** | B2B/B2G and partnership revenue | [`SPONSORS.md`](./SPONSORS.md), [`EDUCATION.md`](./EDUCATION.md) | Bible §11–12 | Partner-facing features | Deals, zero-rating, sponsor ROI |

### Engineering & operations

| Agent | Mission | Owns | Reads | Approval gate | KPIs |
|---|---|---|---|---|---|
| **Backend / Frontend Architect** | Right authority split; small, fast, correct | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Bible §15 | Schema/API/authority | p95 latency, error rate |
| **Performance Engineer** | Hold the KB/FPS budget on low-end Android | [`PERFORMANCE.md`](./PERFORMANCE.md), [`GAME-FEEL.md`](../GAME-FEEL.md) | all code | Any bundle-size change | Bundle KB, FPS, TTI |
| **Security Engineer** | Server authority where money lives; POPIA | [`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md), [`ANTI-CHEAT.md`](./ANTI-CHEAT.md) | Bible §15–16 | Prize/data paths | Fraud caught, breaches (0) |
| **AI Engineer / Data Scientist** | Content tooling, anomaly detection, analytics | [`ANALYTICS.md`](./ANALYTICS.md), [`WORD-SYSTEM.md`](./WORD-SYSTEM.md) | all data | Models touching prizes | Cheat detection %, data quality |
| **QA Lead** | Nothing ships broken | [`QA-TESTING.md`](./QA-TESTING.md) | all | Release | Escaped-defect rate |
| **Growth Engineer** | The WhatsApp share/referral loop | [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md) | Bible §7 | Growth surfaces | K-factor, viral cycle time |
| **Technical Writer** | Keep this doc system true and legible | [`README.md`](./README.md), all | all | Doc merges | Doc freshness, link integrity |

---

## Standing rules for every agent (from [`PHASE-TRACKER.md`](./PHASE-TRACKER.md))

- **No paid advantage, ever.** No purchase path for coins/hints/entry/power.
- **60-second rule.** Never gate the first-minute win.
- **Perf budget.** ≤ ~10 KB gz per feature; `transform`/`opacity` only;
  `prefers-reduced-motion` respected.
- **POPIA.** Provable guardian consent for under-18s; data minimization.
- **Verify by playing.** Real low-end Android where possible, else headless at
  414×896.

---

## Escalation

Any agent may **block** a feature in its domain. A block is resolved by
redesigning to satisfy the objection, not by overruling it — except by the
Creative Director + Executive Game Director jointly, recorded in
[`DECISION-LOG.md`](./DECISION-LOG.md) with the reasoning. Constitution violations
([`PRINCIPLES.md`](./PRINCIPLES.md) Principles 1, 3, 4) **cannot** be overruled.
