# PROJECT_STATUS.md — Living Dashboard

**Last updated: 2026-07-08** (perf-budget measurement + login/me bundle fix) · Updated every working session.

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
Latest (2026-07-06): a **full local verification pass** (test/lint/build green,
closing the sandbox caveat), the **unified-streak completion UI** (RFC-0001 Slice A
finished, now ✅), and a **launch-readiness audit** — which found the #1
non-negotiable (POPIA guardian consent for under-18s) entirely unbuilt →
[RFC-0006](./RFC/0006-age-gate-guardian-consent.md), and no word-approval tooling
(both tracks DRAFT) → built `npm run approve-words`, then added an **offensive-word
filter** (both content gates) + [`CONTENT_PIPELINE.md`](./CONTENT_PIPELINE.md).
Latest (2026-07-07): ran the **first-minute (60-second rule) audit** — passes at
the product level (Journey is the ungated on-ramp; no shipped feature gates the
opening win); fixed the one rough edge (a daily guest no longer gets ambushed by a
login bounce — upfront sign-in line + no-sign-in Journey path).
Latest (2026-07-08): **accessibility pass** — the daily board's tile/keyboard state
was colour-only (the classic word-game trap); added shared `MARK_LABEL` →
`aria-label`s on tiles + keys and a polite `aria-live` guess announcer. Then
extended to the **Journey**: an `aria-live` region announces found/bonus/rejected
words + completion, an sr-only instruction makes the keyboard/typing path
discoverable, and the wheel + grid got `role="group"` labels. Zero visual change. Then closed
the last named a11y gap with the **colour-blind symbol mode** (always-on): every
correct tile/key carries a small dot, every wrong-spot tile/key a diamond — pure
CSS `::after` (~0.6 KB, no DOM/JS/settings), revealed at the flip midpoint,
reduced-motion respected; how-to-play legend updated; verified by playing
headless at 414×896. **Double-sided referral
(RFC-0005) is deliberately held** by its own Decision until the pilot has an
active-user base — pre-launch, growth rides the shipped share-card + challenge
loops. **B2 repair + Perfect-Week v2 stay held**
until B1 data justifies them (don't build blind).

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
✓ Unified cross-mode streak — Slice A (Journey feeds profile streak + inline streak/shield UI on the Journey card; RFC-0001)
✓ Streak shields — Slice B1 (2 free, auto-bridge short gaps; RFC-0002, migration 0005)
✓ Perfect Week — v1 (repeating gold pride state, whole-week streak multiples; RFC-0003)
✓ Friend challenges — v1 (URL-carried spoiler-free "beat my score", both modes; RFC-0004)
```

## In progress

```
• (nothing mid-slice — verification pass + unified-streak completion UI landed)
```

## Not started (next up in Phase 1)

```
• Double-sided referral (RFC-0005) — HELD by its own Decision until the pilot has
  an active-user base worth referring from (pre-launch = zero users; don't build blind)
• Streak repair — Slice B2 (HELD until B1 data justifies it; RFC-0002)
• Perfect Week v2 — +1 shield per week (HELD until B1 shield-scarcity data; RFC-0003)
• Launch-readiness (real critical path): isiXhosa native review, attorney pass on
  /rules + /privacy, prod puzzle scheduling, supabase db push — mostly user tasks
```

## Blocked / at risk

```
⚠ POPIA guardian consent      under-18 age gate NOT built (RFC-0006) — HARD launch
                              gate + the standing #1 principle; needs counsel sign-off
⚠ Word approval               both tracks DRAFT (English too) → no prod puzzles until
                              reviewed + approved; tool now exists (npm run approve-words)
⚠ Offensive screen coverage   filter built + wired to both gates, but per-language
                              blocklists thin (xh/af/zu = 0) → native lists needed
⚠ isiXhosa dictionary depth   ~356-word DRAFT + only ~156 guess words   (RISK R1)
⚠ Pilot launch                needs guardian consent + native review + attorney pass
⚠ Tournament / sponsor work   correctly deferred to Phase 3–4 (not blocked — sequenced)
```

## Verification snapshot (2026-07-06, real machine)

The "couldn't run in the sandbox" caveats on Slices A / B1 / Perfect Week /
Challenges are now **closed** — the full toolchain was run locally on Windows:

```
npm test    ✅ 106/106 pass (16 files)
npm run lint ✅ clean (fixed 1 stale unused-import warning in signature/catalog.ts)
npm run build ✅ green — 36 routes compile, TypeScript clean
supabase db push  ⬜ still pending (needs the live Supabase project — user task)
```

## Performance snapshot (2026-07-08 — first real numbers)

*Measured by the new `npm run perf-budget` (gzips the actual chunks from the
route client-reference manifests — Next 16 stopped printing sizes). "Route-only"
= a route's first-load JS minus the chunks every route shares; it's the upper
bound on any one feature there.*

```
Build status                     ✅ green locally
Shared baseline (all routes)     151.0 KB gz  (framework + layout; cached after 1st visit)
CSS (all routes)                 10.7 KB gz
Route-only, worst first:
  /journey/[track]/[level]       17.2 KB  ⚠ whole Journey mode (wheel+grid+reducer+sky
                                            = several features; no single feature ≥10)
  /play/[track]                   9.2 KB  ok — the entire daily game
  /                               4.3 KB  ok
  /login                          2.6 KB  ok — WAS 64.8 KB (supabase-js now lazy)
  /me                             0.4 KB  ok — WAS 62.6 KB (SignOutButton pulled supabase-js)
  everything else                ≤ 5.7 KB ok
Sustained FPS (low-end Android)  TBD — measure on device (target ≥60)
```

> **Honesty note:** the ≤10 KB rule is per *feature*; the 151 KB shared baseline
> is framework + root layout, outside that rule but real data cost on first
> visit (cached afterwards). The Journey-level
> route bundles the whole mode — fine today, but it's the page to watch. FPS
> remains unmeasured on hardware. Re-run `npm run perf-budget` after any
> feature and record deltas here. See [`PERFORMANCE.md`](./PERFORMANCE.md).

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
