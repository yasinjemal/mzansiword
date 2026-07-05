# SIGNATURE-MOMENTS.md

**Owner:** Creative Director · **Canonical:** [Bible §6.5](./GAME-DESIGN-BIBLE.md#6-progression-mastery--player-identity)

Retention explains why players come back. **Signature Moments explain why they
fall in love and why they tell someone else.** They are engineered memories — the
one-sentence stories players quote unprompted ("solved it in 2," "365-day
streak") — made unmistakably South African.

## The five design rules (so this stays a system, not a pile of popups)

1. **It has a name and an emotion** — a player can *say* it in one sentence.
2. **It is rare enough to matter** — tiered by difficulty; a moment that fires
   every session is wallpaper. Reserve the biggest celebrations for real milestones.
3. **It is shareable by design** — every moment emits a spoiler-free,
   WhatsApp-ready card ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)). The moment and the
   share are the same event.
4. **It is unmistakably local** — provinces, schools, home languages, SA wildlife,
   landmarks, Ubuntu. This is the un-copyable moat.
5. **It's cheap to build** — mostly milestone detection on data already tracked.

## Current implementation (2026-07)

Engine + both game modes shipped and execution-verified (14/14 detection tests).
Code: `src/lib/signature/*` (catalog, pure detection + tests, client+server
store), `SignatureMomentCard`, migration `0004_signature_moments.sql`,
`/api/signature`. Wired into the daily solve (`Game.tsx`) **and** Journey
completion (`JourneyGame.tsx`).

**13 active moments fire:** first-solve, clutch / hole-in-one, streak 7/30/100/365,
words 100/500/1000, chapter completion, journey-50.

**4 planned moments** (promote once dependencies exist): province-first, school
#1, collection completion, Grade-5 vocab collection — gated on leaderboards
([`COMPETITIVE.md`](./COMPETITIVE.md)) and word categories ([`WORD-SYSTEM.md`](./WORD-SYSTEM.md)).

## The signature set (grow the library continuously)

- 🇿🇦 "You discovered your **1,000th South African word**." *(mastery pride + educational proof.)*
- 🔥 "**100-day Ubuntu streak**." *(loss-aversion payoff no global game can copy.)*
- 🏆 "**First player in Limpopo today**." *(provincial belonging + daily appointment.)*
- 🎓 "**Completed the Grade 5 vocabulary collection**." *(school/parent-facing.)*
- 📖 "**Discovered every animal word**." *(clean, nameable collection goal.)*
- 🌍 "**Represented Eastern Cape in a national tournament**." *(the "I represented" moment.)*
- 🎉 "**Your school reached #1 this week**." *(shared, social, inherently viral.)*

## KPIs

Moment fire rate per DAU, share rate per moment, and D7 lift for players who hit
their first moment vs. those who don't.

## Open questions

- Celebration intensity ceiling on low-end devices (perf budget vs. delight).
- Distinct from **Mzansi Moments** (SA vignettes every 5th Journey level,
  `MzansiMoment.tsx`) — keep the naming clear to avoid team confusion.
