# SOCIAL-VIRAL.md

**Owner:** Growth Engineer + Community Manager · **Canonical:** [Bible §7](./GAME-DESIGN-BIBLE.md#7-social--viral-systems)

Growth in South Africa is a WhatsApp phenomenon: 93.9–96% of internet users are
on it, 34% call it their favourite app ([`RESEARCH-2026.md`](./RESEARCH-2026.md)).
The first touch is almost always a **forwarded link**, not an app-store listing.
Design every social surface for that link (Principle 11).

## The share card is the product's most important pixel

Wordle grew from 90 to millions on a spoiler-free, comparable result card with
zero ad spend. MzansiWord's card shows your result **without spoiling the answer**,
localized with SA flavour, one tap to WhatsApp.

- **Status (2026-07):** shipped — `share.ts` (`buildShareText`,
  `whatsappShareUrl`), emoji grid + streak; per-moment cards via
  `signature/share.ts` + `SignatureMomentCard`. This is the highest-durability
  growth channel and it exists. Guard it against regressions.

## Sequence (ship in this order)

1. **Share cards** — done. Spoiler-free, WhatsApp-optimized.
2. **Double-sided referral** — both inviter and invitee get coins/cosmetics/
   shields (free-to-deliver, so ungameable for real value; the legal constraint
   enforces this). Aim K ≈ 0.4–0.6 compounded by a *fast daily* share cycle;
   sustained K > 1 is rare — don't plan on it. **Status: not started.**
3. **Friend challenges** — "beat my score on today's puzzle" via WhatsApp
   deep-link; reuse the share infra. The most natural social loop in the design.
   **Status: not started (Phase 1).**
4. **Clubs** — the group-identity engine (school/province/workplace/freeform),
   roles (President/VP/Senior/Member), club chat, **bi-weekly club race** where
   every member's daily play adds to a shared score. Individual absence visibly
   hurts your school — that's the retention mechanism. Substrate for the whole
   competitive layer ([`COMPETITIVE.md`](./COMPETITIVE.md)). **Status: Phase 3.**

## What NOT to build yet

A full social feed, friend-of-friend discovery, or public follow graphs are
premature — the moderation/POPIA cost far exceeds early value (Bible §7.5). Ship
share cards, referrals, friend challenges, and clubs first.

## Moderation prerequisite

Any chat or UGC needs auto-moderation across SA languages, reporting,
mute/shadowban, and human oversight at peak evening hours **before** it opens.
See [`ANTI-CHEAT.md`](./ANTI-CHEAT.md) and Bible §16.

## KPIs

K-factor, viral cycle time (target: daily), share rate per DAU, referral
activation rate, club participation and race completion.
