# PROJECT_STATUS.md — Living Dashboard

**Last updated: 2026-07-06** (streak shields Slice B1) · Updated every working session.

> **Boundary:** this is the *at-a-glance* dashboard — milestone, progress, perf,
> top risks. The *detailed* slice-by-slice build log lives in
> [`PHASE-TRACKER.md`](./PHASE-TRACKER.md); the *why/order* lives in
> [`ROADMAP.md`](./ROADMAP.md). If this file and the tracker ever disagree, the
> tracker is authoritative and this file is stale — fix it.

---

## Current milestone

**Phase 1 — Unify & harden the habit** ([`ROADMAP.md`](./ROADMAP.md#year-1--foundation--habit))

```
Phase 1 progress   ███████░░░░░░░  ~50%   (estimate — see tracker for basis)
```

Just shipped: **Streak shields — Slice B1** (2026-07-06) — every player holds up
to 2 shields that auto-bridge short gaps so a missed day no longer resets a
fragile new streak (RFC-0002; unified streak Slice A landed the same day).
Also shipped: **Perfect Week — v1** (RFC-0003) and **Friend challenges — v1**
(RFC-0004) — both 2026-07-06, both reward-free and client-side (a URL-carried,
spoiler-free "beat my score" for challenges).
Current focus: **double-sided referral** (SOCIAL-VIRAL #2) next; **B2 repair +
Perfect-Week shields held** until B1 data justifies them (don't build blind).

## Completed (foundation + Phase 1 so far)

```
✓ Daily prize game (Wordle-style, server-validated)
✓ Nightly airtime draw (CPA s36, auditable, verify-draw)
✓ Prize claim + payout + admin console
✓ Journey mode (letter-wheel crossword, offline, client-authoritative)
✓ Game feel: FX / synth sound / springs / parallax / shader sky
✓ Spoiler-free WhatsApp share card
✓ Profile + POPIA consent + event tracking
✓ Signature Moments (engine + both modes, 13 active, 14/14 detect tests)
✓ Unified cross-mode streak — Slice A (Journey feeds profile streak; RFC-0001)
✓ Streak shields — Slice B1 (2 free, auto-bridge short gaps; RFC-0002, migration 0005)
✓ Perfect Week — v1 (repeating gold pride state, whole-week streak multiples; RFC-0003)
✓ Friend challenges — v1 (URL-carried spoiler-free "beat my score", both modes; RFC-0004)
```

## In progress

```
• (nothing mid-slice — B1 + Perfect Week + challenges landed; pick up referral next)
```

## Not started (next up in Phase 1)

```
• Double-sided referral (SOCIAL-VIRAL #2 — the higher-K social bet)
• Streak repair — Slice B2 (HELD until B1 data justifies it; RFC-0002)
• Perfect Week v2 — +1 shield per week (HELD until B1 shield-scarcity data; RFC-0003)
• (optional) Journey-specific "streak saved" celebration card
```

## Blocked / at risk

```
⚠ isiXhosa dictionary depth   ~390-word DRAFT → ~15 levels   (RISK R1, critical path)
⚠ Pilot launch                needs native review + attorney pass + prod scheduling
⚠ Tournament / sponsor work   correctly deferred to Phase 3–4 (not blocked — sequenced)
```

## Performance snapshot

*Measured 2026-07-06 from the existing `.next/static` artifacts — but that build
dates to 2026-07-04, so it **predates Slice A** (streak). `next build` could not run
in this sandbox (offline: `@next/swc-linux-x64-gnu` can't be fetched from
registry.npmjs.org), so these are raw chunk totals, not per-route First Load JS.
The meaningful player-facing number still needs a fresh `next build` on a real
machine.*

```
JS  (all static chunks, raw)     ~984 KB      largest single chunk 69.3 KB gz
CSS (all, raw)                   ~48 KB
Largest gz JS chunks             69.3 / 62.3 / 38.6 / 37.7 KB  (framework + app)
First Load JS per route (gz)     TBD — run `next build` on a real machine
Sustained FPS (low-end Android)  TBD — measure on device (target ≥60)
Per-feature budget (≤10 KB gz)   Not verified this run — needs per-route build
```

> **Honesty note (Principle: 🟡 > optimistic ✅):** do not stamp "bundle budget
> PASS" globally until per-route First Load JS is measured. The ≤10 KB rule is
> *per feature*, not total app. Record real numbers here after the next
> `next build`. See [`PERFORMANCE.md`](./PERFORMANCE.md).

## Top open risks (full register: [`RISK-REGISTER.md`](./RISK-REGISTER.md))

```
#1  isiXhosa dictionary quality/depth      Critical   (R1)
#2  Coins-for-tickets legal question        Critical   (R2)  — attorney gate
#3  Multiplayer/tournament cheating         High       (R7)
#4  Child-safety / POPIA at scale           Critical   (R6)
#5  Monetization vs. prize+infra cost       High       (R3)  — telco deal is load-bearing
```

## How to update this file

1. Move the milestone pointer and progress bar when a slice lands.
2. Refresh the perf snapshot after any `next build` — with *real* numbers.
3. Re-rank top risks if severity changes.
4. Bump **Last updated**. Keep it honest — a stale dashboard is worse than none.
