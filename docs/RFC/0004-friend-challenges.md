# RFC-0004 — Friend challenges ("beat my score")

- **Status:** Accepted — v1 shipped 2026-07-06 (stretch dynamic-OG preview deferred).
- **Author / Deciders:** Growth Engineer, Senior Game Designer, Security Engineer,
  Community Manager. Reuses the share infra ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md) #3).
- **Date:** 2026-07-06

## Problem

WhatsApp is the whole growth channel — first touch in SA is a **forwarded link**,
not an app-store listing ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md)). We already
ship the spoiler-free result card (`share.ts`), but it is a **one-way brag**:
Sipho posts "4/6 🔥12" and… nothing comes back. There is no *reciprocal hook* — no
reason for the friend to play *and reply*. The share card seeds awareness; it does
not close a loop. Friend challenges add the return leg — "beat my score on today's
word" — which is the most natural social loop in the design and the cheapest path
toward a **daily viral cycle** (the KPI that matters most, [`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md)).

## Named emotion (Principle 6)

*"Oh, my chommie thinks they're sharper than me? Watch this."* Playful, warm
rivalry — ubuntu-competitive, never toxic. And on the receiving end: *"Someone
picked me for a duel — let's go."*

## Research

- **Wordle's growth was the comparable result** shared to group chats; the missing
  piece it never had was a *direct challenge back*. Head-to-head reciprocity is
  what turns a broadcast into a cycle ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md),
  Bible §7).
- SA WhatsApp reality: manual forward via the OS share sheet (`wa.me`) — **no
  address-book upload, no follow graph** (those are explicitly "what NOT to build
  yet", §7.5, POPIA cost > value).
- Target **K ≈ 0.4–0.6 with a fast daily cycle** ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md));
  challenges are the daily-cycle driver.

## Proposal

**v1: a stateless, spoiler-free, reward-free challenge carried entirely in the
deep-link URL.** No new table, no social graph, no server trust.

**The "score" is guess count** (Wordle's `N/6`, `X` on a fail) — the one honest,
verifiable, calm metric. **Not time** (see Alternatives/Case against: speed
encourages the fast-solve anti-cheat problem and stress).

**The loop:**
1. Sipho solves today's isiXhosa word in 3. The result panel's existing share
   button gains a **"Challenge a chommie"** variant whose `wa.me` message carries a
   deep link with a compact challenge token:
   `…/p/xh?ch=<base64url({v:1, n:"Sipho", p:42, g:3})>`
   — challenger first name (≤12 chars, sanitised), puzzle number, guesses (0 = fail).
   **Only marks/counts, never letters** — spoiler-safe by construction.
2. Thandi taps the link → `/p/xh` **forwards the query** to `/play/xh?ch=…` (a
   one-line fix — the redirect currently drops query params). She lands **straight
   in a playable puzzle** (guest play already works — the 60-second rule is not
   gated) with a small banner: *"🏆 Sipho challenges you — beat 3/6."*
3. Thandi solves in 2. The result panel shows the head-to-head — *"You beat Sipho!
   2 vs 3 🎉"* — and a **"Send it back"** button that mints *her* challenge token
   back into the same chat. Loop closed.

**Validity guard:** the token is only meaningful for **today's puzzle in that
track** (SAST). If `p` ≠ today's puzzle number, drop the comparison gracefully
(*"That challenge was for an earlier word — here's today's"*) and let her just play.

**Reward-free & client-authoritative** (like Signature Moments / Perfect Week v1):
the outcome feeds **nothing** with value — no coins, shields, or league points.
Spoofable by design, and that's fine because there is nothing to win.

**Telemetry:** `challenge_sent` (tap), `challenge_opened` (land via `ch`),
`challenge_completed` (finish a challenged puzzle) → the K-factor row in
[`../TELEMETRY.md`](../TELEMETRY.md).

**Stretch (v1.1, not now):** challenge-aware OG preview so the WhatsApp link itself
reads *"Sipho challenges you to beat 3/6 in isiXhosa."* Needs dynamic OG tags on
the landing; nice, not required.

## Cost

- **Client:** a challenge-CTA variant (reuses `whatsappShareUrl`), a ~15-line token
  encode/decode, a pre-game banner, a head-to-head row in `ResultPanel`, "Send it
  back". Est. **~3 KB gz** — inside budget.
- **Backend:** effectively none. One line so `/p/[track]` preserves the query
  string on redirect. Play page reads/validates `ch` server-side (no DB).
- **Maintenance:** low, but the spoiler-safety invariant is load-bearing (below).

## Accessibility

Banner and head-to-head are text + icon (🏆), never colour-only; screen-reader
announced; one-thumb. No new animation (reuses existing panel). Plain, warm
language in SA register. The challenged newcomer must reach a playable board with
zero extra taps (60-second rule).

## Legal / safety

- **No paid advantage** (Principle 1, CPA s36): challenges are reward-free — nothing
  purchasable or winnable rides on the outcome.
- **POPIA:** no contacts access, no graph, no server-stored personal data. The only
  personal datum is the challenger's **own first name**, placed by them into a link
  they themselves forward to a contact they chose — minimal and self-disclosed.
  Sanitise + length-cap `n` (it is rendered — escape to prevent XSS/link injection).
- **Spoiler/fairness invariant (the load-bearing rule):** the token carries **only
  guess count / emoji marks, never letters**. Knowing a friend solved in 3 gives no
  edge (it reveals nothing about the answer). This invariant must never be relaxed.

## Alternatives

- **A. Server-side challenge records + accept flow.** Rejected for v1: needs a
  table, RLS, share tokens or a graph, and drags in moderation/POPIA surface the
  §7.5 guidance says to defer. The URL *is* the state — cheaper and safer.
- **B. Time/speed score.** Rejected: rewards fast-solving (the exact behaviour the
  daily flags as suspicious, `FAST_SOLVE_MS`), adds stress, and `solve_ms` is
  unreliable for first-guess solves. Guess count is the honest metric.
- **C. Global async leaderboard ("ghost" of all players).** That is the Weekly
  League (Phase 2) — needs leaderboard tables. Out of scope.
- **D. Do nothing — keep the plain share card.** The card broadcasts; it does not
  return. Challenges add the reciprocity that makes the cycle *daily*.

## Case against (the honest ≥20%)

1. **The score is thin, so most duels are draws.** Daily scores cluster hard at 3/6
   and 4/6; a large fraction of head-to-heads will tie, which is anticlimactic — the
   competitive payoff may be materially weaker than the pitch. We deliberately
   rejected the one metric (time) that would separate ties. Mitigation is only
   *copy* ("Dead heat! Rematch tomorrow"), not mechanics. **Honest risk: this may
   not beat the plain share card enough to justify itself** — instrument send-rate
   and challenge-driven activation, and if both are flat, cut it.
2. **The whole feature's safety is one invariant.** "Only marks, never letters."
   The moment anyone adds the friend's *words* to the token, or a dynamic OG preview
   leaks the answer, we've broken the spoiler promise **and** handed an unfair edge.
   A simple feature with a single catastrophic failure mode is a maintenance
   liability — it needs a test that asserts no letters ever enter the token.
3. **Client-authoritative = the "score" is meaningless.** Thandi can edit the URL to
   "beat" anyone. Harmless in v1 (nothing to win), but it hard-couples us to a rule:
   **challenge outcomes must never feed rewards.** When double-sided referral
   (SOCIAL-VIRAL #2) ships with real free-to-deliver rewards, someone will be
   tempted to reward "winning a challenge" — that would be an instant free faucet.
   This RFC pre-commits against it.
4. **Stale/mismatch confusion is real complexity in a "simple" feature.** Late
   opens, wrong track, post-midnight SAST rollover, a friend on a track you don't
   play — each needs a graceful fallback or the feature feels broken. The guard
   logic is small but easy to get subtly wrong (timezone!).
5. **We're building #3 before #2.** [`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md)
   sequences **referral** before challenges, and referral's double-sided reward is
   plausibly the higher-K play. Doing challenges first is defensible *only* because
   they are reward-free (zero CPA/legal surface) and reuse shipped infra — genuinely
   cheaper to land — but we are trading a possibly-higher-K feature for a
   definitely-cheaper one. Name it, don't pretend it's strictly optimal.
6. **First-minute discipline.** If the challenge landing shows a "who challenged
   you" wall, or nudges signup before play, we break the 60-second rule for the exact
   new user a challenge is meant to convert. The comparison must be a *post-solve*
   reward; the board must be instant.

**Honest recommendation from this section:** ship v1 **small and reward-free**,
with a test pinning the spoiler invariant, and treat it as an experiment measured by
challenge-driven *activation*, not vanity send counts. If the draw-heavy score makes
duels dull, don't bolt on speed — reconsider whether referral (#2) is the better
next social bet.

## Decision

Proceed with **v1**: a stateless, spoiler-free, reward-free, guess-count challenge
in the deep-link URL, with a post-solve head-to-head and a "send it back" hook, in
both live tracks. **Judged by** ([`../ANALYTICS.md`](../ANALYTICS.md)): (a) challenge
send-rate per solver, (b) `challenge_opened → challenge_completed` conversion, and
(c) **challenge-driven new-user activation** (the real K contribution) — not raw
send volume. **Hold** any coupling of challenge outcomes to rewards.

## Hand-off checklist for the IDE

- [x] Token codec `src/lib/challenge/token.ts` (encode/decode/sanitize/validity) + `outcome.ts` head-to-head; tests incl. one asserting **no letters** ever serialise (`token.test.ts` "spoiler-safety invariant").
- [x] `/p/[track]` preserves the query string on redirect to `/play/[track]`.
- [x] Play page reads + validates `ch` (matches today's puzzle number; track comes from the path), passes `challenge` + `challengeStale` + `playerName` to `Game`.
- [x] Pre-game banner (spoiler-free) + post-solve head-to-head + "Send it back 🔁" in `ResultPanel`.
- [x] `challenge_sent` / `challenge_opened` / `challenge_completed` telemetry (client whitelist + enum); `challenge_completed` only fires when finished *this* session.
- [x] Guest can play a challenge with zero gating (60-second rule); challenger name is sanitised + length-capped in the token codec.
- [x] `npm test` (106) && `npm run lint` (0 errors) && `npm run build` (clean); PHASE-TRACKER / PROJECT_STATUS flipped.

**Deferred (honest):** the stretch **dynamic-OG preview** (so the WhatsApp link
itself reads "Sipho challenges you…") is NOT built — the link shows the generic
play-page preview; the challenge context appears once the friend opens the board.
Not yet exercised in a running app (logic is unit-tested; the UI is unverified
end-to-end).
