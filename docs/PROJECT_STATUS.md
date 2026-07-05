# PROJECT_STATUS.md — Living Dashboard

**Last updated: 2026-07-06** (unified streak Slice A) · Updated every working session.

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

Just shipped: **Unified cross-mode streak — Slice A** (2026-07-06) — Journey
completions now feed the one profile streak (RFC-0001). Signature Moments engine
landed 2026-07-05.
Current focus: **streak shields + free repair (Slice B)** — the forgiving week-one
layer that protects the new habit.

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
  ↳ needs local npm test / build to confirm (sandbox can't run native toolchain)
```

## In progress

```
• Streak shields (2 free) + free effort-based repair   (Slice B — needs migration 0005)
```

## Not started (next up in Phase 1)

```
• "Perfect Week" gold state
• Friend challenges (WhatsApp "beat my score")
• (optional) surface returned streak in Journey completion UI
```

## Blocked / at risk

```
⚠ isiXhosa dictionary depth   ~390-word DRAFT → ~15 levels   (RISK R1, critical path)
⚠ Pilot launch                needs native review + attorney pass + prod scheduling
⚠ Tournament / sponsor work   correctly deferred to Phase 3–4 (not blocked — sequenced)
```

## Performance snapshot

*Measured from the current `.next/static` build on 2026-07-06. These are raw
totals, not per-route First Load JS — the meaningful player-facing number needs a
fresh `next build` summary.*

```
JS  (all static chunks, raw)     ~968 KB      largest single chunk ~69 KB gz
CSS (all, raw)                   ~47 KB
Largest gz JS chunks             69 / 62 / 39 / 38 KB  (framework + app)
First Load JS per route (gz)     TBD — run `next build` and record here
Sustained FPS (low-end Android)  TBD — measure on device (target ≥60)
Per-feature budget (≤10 KB gz)   PASS by discipline; verify per-feature at build
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
