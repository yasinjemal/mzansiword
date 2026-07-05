# ROADMAP.md

**Owner:** Executive Game Director · **Canonical:** [Bible §17](./GAME-DESIGN-BIBLE.md#17-roadmaps) · **Live status:** [`PHASE-TRACKER.md`](./PHASE-TRACKER.md)

This is the strategic sequence. The **live build status** (what's shipped, partial,
in progress) lives in [`PHASE-TRACKER.md`](./PHASE-TRACKER.md) — this doc is the
*why* and the *order*; that doc is the *now*. Everything is prioritized by three
tests: **retention impact, scalability, sustainability.**

## The sequencing principle (Principle 10)

**Async score-attack is the keystone** ([`COMPETITIVE.md`](./COMPETITIVE.md)). Each
phase reuses the previous phase's tech; leagues, clubs, school-vs-school, and
tournaments are all aggregations of it. Build one thing well and reuse it. Resist
building all fifteen multiplayer modes ([`RISK-REGISTER.md`](./RISK-REGISTER.md) R4).

## Year 1 — foundation & habit

- **Q1 — Unify & harden the habit:** unified profile + single cross-mode streak
  (2 shields, free repair); spoiler-free share card + friend challenges; pilot
  legal checklist; **begin isiXhosa expansion (starts now, runs continuously).**
  *(The current phase — see tracker.)*
- **Q2 — Social retention:** Weekly League; player-chosen missions; rewarded-ad
  integration (first revenue); intelligent/WhatsApp notifications.
- **Q3 — Competition & first sponsor:** async score-attack + ranked ELO/MMR;
  clubs + club races; **first telco conversation (the pivotal partnership).**
- **Q4 — Platform seed & native wrap:** tournament engine v1 (async + Swiss) with
  anti-cheat; first branded tournament; Capacitor native wrap; cosmetic economy v1.

## Year 2 — platform & institution

isiZulu launch; education platform v1 (free school core, teacher dashboard,
mastery analytics, certificates); sponsor dashboard; school-vs-school and
province-vs-province at scale; subscription (MzansiWord Plus); season pass;
real-time blitz duels (density-gated); monthly championships; full moderation stack.

## Years 3–5 — national institution → African platform

National championship + TV/radio + streamed finals; CSR/government education
partnership at national scale (Siyavula model); language expansion (all SA
official → pan-African); **creator ecosystem** (teachers, universities,
municipalities, tourism, museums, wildlife author their own packs — gated behind
a mature moderation stack and real scale, invite-only pilot first); regional
expansion (Nigeria, Kenya, Egypt); assessment/certification product.

## The five things that gate everything

If forced to protect only five efforts (Principle, [`PRINCIPLES.md`](./PRINCIPLES.md)):
build the streak, ship the share card, land the telco, deepen the isiXhosa
content, sequence off async score-attack.

## What we deliberately defer or cut

The Rive mascot (parked); a full social feed / follower graph (moderation cost >
early value); the fifteen named multiplayer modes as *separate builds*
(configurations of async score-attack); coins-purchasable-anything (illegal here);
national championships in year one (no audience to fill them yet). None are bad
ideas forever — they're bad ideas *first* ([`DECISION-LOG.md`](./DECISION-LOG.md)).
