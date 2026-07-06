# RFC-0003 — Perfect Week (a weekly gold pride state)

- **Status:** Draft — ready to hand to the IDE.
- **Author / Deciders:** Behavioral Psychologist, Senior Game Designer, Frontend
  Lead. Builds on [RFC-0001](./0001-unified-cross-mode-streak.md) (unified streak)
  and [RFC-0002](./0002-streak-shields-and-repair.md) (shields).
- **Date:** 2026-07-06

## Problem

The unified streak (RFC-0001) is the retention spine, and Signature Moments
(Bible §6.5) already celebrate streak **milestones** — 7, 30, 100, 365 — but
those are *one-time* and *far apart*. Between day 7 and day 30 a committed player
gets **twenty-two days of showing up with no acknowledgement at all**. The habit
loop rewards the flame's *number* but never the *rhythm* of a full week done. The
one repeating cadence humans actually live by — the week — goes uncelebrated.
RFC-0002 also explicitly named "Perfect Week" as the eventual **earn source for
shields** ("+1 per Perfect Week, capped"), so its absence blocks a future faucet.

## Named emotion (Principle 6)

*"I showed up all week — and the game noticed."* Quiet, repeatable weekly pride —
not a milestone trumpet, a satisfied nod.

## Research

- **Fixed weekly cadence** is the backbone of habit apps: Duolingo's weekly
  streak/"Streak Society" and weekly-goal chests exist precisely because a 7-day
  rhythm matches how people schedule life ([`../RESEARCH-2026.md`](../RESEARCH-2026.md) §3).
- **Forgiving early, meaningful throughout** ([`../RETENTION.md`](../RETENTION.md)
  §5.1): a low-key weekly reward sustains the mid-funnel (D7→D30) that milestones
  leave bare.
- Bible §17 Q1 lists "*Perfect Week gold state*" as a Phase-1 slice, described as a
  *no-reward pride state — the cheapest sticky reward there is*. This RFC honours
  that description literally for v1.

## Proposal

**v1 (this RFC): a pure, repeating gold pride state. No economic reward.**

- **Trigger:** when a qualifying action (daily solve **or** Journey level — either
  mode, the streak is unified) advances the streak to a **positive multiple of 7**
  (14, 21, 28, …). Day **7** is deliberately *excluded* — it is already owned by
  the `streak-7` Signature Moment; Perfect Week is the *repeat* beat that fills the
  gaps the milestones leave.
- **Celebration:** a dismissible gold "Perfect Week" card (🏆), reusing the shared
  `celebrate` helpers (confetti + haptic, both `prefers-reduced-motion`-gated).
  Shareable to WhatsApp, reusing the existing share infra.
- **One celebration per solve:** if that same solve already earned a Signature
  Moment (e.g. `streak-30` at day 30, or `clutch-two`), the moment wins and Perfect
  Week is suppressed — no stacked cards, no wallpaper.
- **Client-authoritative,** exactly like Signature Moments (Bible §13): v1 has **no
  prize/economy value**, so the client resolves it from the `streak` already
  returned by `/api/guess` and `/api/journey/complete`. **Zero backend, zero
  migration, zero change to the atomic streak function.**
- **De-dupe:** a per-value localStorage guard (`mw:perfectweek:v1`) so the same
  streak value never re-fires within a day or across a same-day cross-mode action.
- **Telemetry:** a new `perfect_week` event (client → `/api/track` whitelist).

**v2 (staged, NOT in this RFC): +1 shield per Perfect Week, capped at 2.** Held
behind RFC-0002 **B1 data** — build it only if shields prove *scarce enough to hurt
week-one retention*. When we do, **the shield grant must move server-side** into
the atomic streak function (a faucet with value cannot be client-authoritative);
this RFC's v1 is deliberately valueless so it can stay on the client safely.

## Cost

- **Client:** one small card component + a ~10-line pure helper + one localStorage
  key. Est. **~1.5 KB gz** — well inside the ≤10 KB/feature budget. No new deps
  (confetti already bundled).
- **Backend / DB:** none.
- **Maintenance:** low — a pure `isPerfectWeek(streak)` with tests, and the dedupe
  guard. The only ongoing risk is the copy/dedupe interplay with Signature Moments.

## Accessibility

Reduced motion via the shared `celebrate` helpers (no bespoke keyframes); the card
reuses the moment-card pattern that already honours reduced motion. State is
conveyed by icon **and** text (🏆 + "Perfect Week"), never colour alone; the card
is a dismissible `role="dialog"` with an `aria-label`, one-thumb tap-to-dismiss,
plain language.

## Legal / safety

v1 has **no reward, no prize, no advantage** — Principle 1 (CPA s36) is trivially
satisfied; there is nothing to sell or win. POPIA-neutral (no new data; the one
event carries no PII). When v2 adds shields, shields remain **free/grant-only**.

## Alternatives

- **A. Honest calendar-week with a per-day bitmask** (a `week_active_days`/
  `week_start` pair on `profiles`, set atomically in the streak function; a week is
  "perfect" only if you acted on *all seven* calendar days). More *honest* — a day
  a shield bridged wouldn't count — and aligned to Mon–Sun. **Rejected for v1:** it
  reintroduces exactly the spine complexity + untested migration RFC-0002 spent its
  whole "Case against" warning about, to gain semantics most players won't
  distinguish from "an unbroken 7-day streak." Kept on the table if v2's shield
  faucet ever needs a stricter, spoof-proof definition.
- **B. Grant a shield now (skip the staging).** Rejected — an inflation loop
  (shield → protects streak → more Perfect Weeks → more shields) *before* we have a
  single day of B1 shield-usage data. That is precisely the "don't build the reward
  blind" mistake RFC-0002 was careful to avoid.
- **C. Do nothing.** The D7→D30 valley stays unrewarded and the future shield
  faucet stays blocked. Cheap to fix; not worth leaving.

## Case against (the honest ≥20%)

1. **Wallpaper risk — the catalog's own rule.** The Signature Moments catalog says
   in writing: *"a moment that fires every session is wallpaper, not a memory."*
   Perfect Week fires **every seven days, forever**. By day 35–42 the 🏆 card is a
   chore to dismiss. Mitigations (weekly not per-session, gold not legend, one-tap
   dismiss, deduped against milestones) reduce but do not eliminate this. **If the
   dismiss-rate telemetry shows players swatting it away, we cut it — we do not
   "tune" a nag.**
2. **Honesty wobble.** Because v1 keys off `streak % 7`, a week in which a *shield*
   bridged a missed day still counts as "Perfect." Calling that "Perfect Week"
   risks a mild dark pattern (Principle 2). We accept it **only** by framing the
   copy around the *unbroken streak* ("seven days straight"), never a literal claim
   of perfect daily attendance. This is the single strongest argument for
   Alternative A, and we are choosing convenience over strict honesty here with eyes
   open. Reviewers should push on this.
3. **Client-authoritative = spoofable.** A user can fake a Perfect Week in
   localStorage. Harmless in v1 (nothing to gain) and consistent with Signature
   Moments — **but it plants a trap**: whoever ships v2 must move the shield grant
   server-side, or we hand out a free, unlimited shield faucet. This RFC calls that
   out so the trap is disarmed in advance, but it is a real coupling risk.
4. **Building the pride state before its reason.** Half my rationale for doing this
   *now* is that it feeds shields — yet v1 ships without the shield. So v1 rests
   purely on the bet that a weekly nod lifts D14→D30. If instrumentation says it
   doesn't, this is ~1.5 KB of decoration. Cheap insurance, but let's not pretend
   it's proven.
5. **Dedupe fragility.** The per-value guard can suppress a *legitimately new*
   Perfect Week that happens to land on the same multiple after a streak reset
   (e.g. celebrated at 14, reset, climb back to 14). A rare rough edge we accept
   rather than add server state to fix.

**Honest recommendation from this section:** ship **v1 only** — pure pride, client
side, ~1.5 KB, fully instrumented — and treat it as *disposable*: if dismiss-rate is
high or the D14→D30 signal is flat, delete it. Do **not** build the shield faucet
(v2) until RFC-0002 B1 data proves shields run short.

## Decision

Proceed with **v1**: a repeating, client-side, no-reward gold Perfect Week at every
7-day streak multiple past day 7, deduped against Signature Moments, in both modes.
**Judged by** ([`../ANALYTICS.md`](../ANALYTICS.md)): (a) D14→D30 retention of
Perfect-Week earners vs. matched non-earners, and (b) card **dismiss-rate / time-to-
dismiss** as the anti-wallpaper guardrail. **Hold v2 (shield refill)** pending
RFC-0002 B1 shield-scarcity data.

## Hand-off checklist for the IDE

- [ ] Pure `isPerfectWeek(streak)` in `src/lib/streak/perfect-week.ts` + tests (TS spec, no backend).
- [ ] Per-value localStorage claim guard (dedupe within/across a day).
- [ ] `PerfectWeekCard` — gold, dismissible, shareable, reduced-motion via `celebrate` helpers.
- [ ] `perfect_week` telemetry (client whitelist in `/api/track` + `track-event.ts` enum).
- [ ] Wire daily (`Game.tsx`) and Journey (`JourneyGame.tsx`); suppress when a Signature Moment fires the same solve.
- [ ] `npm test` && `npm run lint` && `npm run build`; flip PHASE-TRACKER / PROJECT_STATUS.
