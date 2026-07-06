# RFC-0006 — Age gate & guardian consent (POPIA under-18)

- **Status:** Draft — for review before code.
- **Author / Deciders:** Security Engineer, Backend Architect, Community Manager,
  Legal (SA counsel sign-off required before ship).
- **Date:** 2026-07-06

## Problem

The standing #1 non-negotiable ([`../PRINCIPLES.md`](../PRINCIPLES.md),
[`../../CLAUDE.md`](../../CLAUDE.md)) is *"POPIA — provable guardian consent for
under-18s; data minimization."* **It is not implemented.** Signup today
([`login/page.tsx`](../../src/app/login/page.tsx),
[`/api/profile/consent`](../../src/app/api/profile/consent/route.ts)) collects a
first name + one consent checkbox and sets `profiles.consent_popia_at`. There is
**no age question, no guardian-consent path, and no age column on `profiles`**
(migration `0001`). Meanwhile the game's own mission targets learners — Grade-5
vocab, school leaderboards (Bible §13, §17.2) — so **minors are expected users**,
not an edge case. Processing a child's phone number + play data with no
competent-person consent is a POPIA §34–35 exposure and a launch blocker
([`../SECURITY-LEGAL.md`](../SECURITY-LEGAL.md)). The
[`/rules`](../../src/app/rules/page.tsx) page already says "18 or older … to win
prizes" — restricting *winning*, not *playing* — which makes the missing
play-time consent worse, not better: we invite under-18s to play and then process
their data silently.

## Named emotion (Principle 6)

*"They asked, and my mom said it's fine — I'm allowed to be here."* Safety and
permission, not a locked door. For the parent: *"I know what my child signed up
for."* The opposite emotion — the one to avoid — is a bureaucratic wall that ends
the session before the first word (60-second rule, Bible §4).

## Research

- **POPIA §34–35 (children):** processing a child's (under-18) personal
  information requires the consent of a *competent person* (parent/guardian).
  POPIA does **not** mandate hard identity verification — it requires consent and
  good-faith reasonableness. So the bar is *a recorded, plain-language guardian
  consent + a reasonable age check*, not government-ID proof (impossible for a
  prepaid-phone teen audience).
- **Self-declared age is the industry norm** (most SA/global apps use a birth-year
  or 18+ affirmation). It is bypassable, but it (a) stops *silent* processing of
  known minors and (b) evidences a good-faith mechanism — which is what
  reasonableness turns on. Hard verification is disproportionate here and would
  violate minimization.
- **Data minimization (POPIA §10):** collect the least that answers the question.
  A **birth year** (or an age band) is sufficient to gate; a full date of birth is
  more than needed and should not be collected.
- **Prizes are already 18+** ([`/rules`](../../src/app/rules/page.tsx)); this RFC
  keeps that and adds the *play-time* consent that's missing. Draw eligibility is a
  solve by an 18+ verified account — unchanged.

## Proposal

**A minimal self-declared age gate with a guardian-consent branch, recorded on
`profiles`, gating play — never gating the offline Journey on-ramp.**

### Flow (added to the existing OTP `profile` step)
1. **Age step** (before the name/consent checkbox): *"What year were you born?"* —
   a year picker (minimization: year only, no day/month). Compute age band.
2. **18 or older →** today's flow unchanged: name + POPIA consent → play.
3. **Under 18 →** a **guardian-consent screen** in plain language: the parent/
   guardian affirms (their name + an explicit "I am this player's parent/guardian
   and I consent" checkbox) before `consent_popia_at` is set. Copy states clearly
   that **prizes are 18+** so a minor plays for the game, not the airtime.
4. Record `birth_year` and, for minors, `guardian_consent_at` + `guardian_name`.
   A minor with guardian consent may **play**; prize eligibility stays 18+
   (enforced where draws select entrants, not just in copy).

### Schema (migration `0006_age_consent.sql`)
```
alter table profiles
  add column birth_year smallint
    check (birth_year is null or birth_year between 1900 and extract(year from now())::int),
  add column guardian_consent_at timestamptz,   -- set only for under-18 signups
  add column guardian_name text;                 -- competent person, for the record
-- No full DOB. Age is derived from birth_year at read time.
-- is_minor is NOT stored (derivable) to avoid a second source of truth.
```

### Gating (server-authoritative)
- `/api/profile/consent` gains `birthYear` (required) and, when the derived age
  < 18, requires `guardianName` + `guardianConsent: true`; it sets
  `guardian_consent_at`. Consent for a minor is invalid without the guardian block.
- **Prize eligibility:** the daily draw's entrant selection filters to accounts
  with derived age ≥ 18 (a solve by a minor still counts for streaks/journey/fun,
  just not for the airtime draw). This makes the "18+ to win" rule *enforced*, not
  just printed.
- The offline **Journey** and the first daily board render remain ungated (60-second
  rule); the gate lives at the same point signup already does — before a *scored,
  identified* daily entry.

### Client
- One extra signup sub-step (year picker) + a conditional guardian panel (~2–3 KB).
  Reuses existing form styles; no new deps.

## Cost

- **Backend:** one migration (3 columns), a `birthYear`/guardian branch in
  `/api/profile/consent`, and an age filter in the draw-entrant query
  ([`draw/select.ts`](../../src/lib/draw/) / the daily-draw cron). Moderate —
  smaller than RFC-0005, but it touches the money path (draws), so it needs care.
- **Client:** ~2–3 KB for the age step + guardian panel.
- **Maintenance:** birth-year edge cases (leap of trust on self-declaration),
  and copy that must stay legally accurate. The guardian branch is a new consent
  record to retain (CPA/POPIA record-keeping).

## Accessibility

Year picker is a large-target native `<select>` (one-thumb, screen-reader
labelled); guardian panel is plain language at a low reading level; no colour-only
state; reduced-motion inherited. Error copy is specific ("Choose your birth year"),
never a dead end. The offline Journey remains reachable with zero gating for anyone.

## Legal / safety

- **POPIA §34–35:** records a competent-person consent for minors and a birth year
  for everyone — the good-faith mechanism that was absent. **SA counsel must sign
  off the guardian copy + the age-gate approach before ship** (this RFC is
  directional, per [`../SECURITY-LEGAL.md`](../SECURITY-LEGAL.md)).
- **POPIA §10 minimization:** birth *year* only; no full DOB; `is_minor` derived,
  not stored. `guardian_name` is the sole new free-text field.
- **CPA s36:** prizes stay 18+ and free-entry; enforcing the age filter on draw
  entrants closes the gap between the printed rule and the code.
- **Honest limance:** self-declaration cannot *prove* age. This is accepted as
  reasonable + proportionate for the audience; the RFC does not claim hard
  verification (see Case against).

## Alternatives

- **A. 18+ only — ban under-18s from playing.** Rejected — contradicts the
  education mission (schools, Grade-5 vocab); throws away the core audience to dodge
  a solvable consent step.
- **B. Full date of birth.** Rejected — more personal data than needed (POPIA §10);
  birth year answers the only question we have (over/under 18).
- **C. Hard age verification (ID / credit card).** Rejected —
  disproportionate, exclusionary for a prepaid-phone teen base, and itself a
  bigger POPIA surface. Not what §35 reasonableness requires.
- **D. Do nothing / keep silent processing.** Rejected — it *is* the current
  state and it's the launch blocker. This is the honest "cost of not building"
  baseline (see Case against).

## Case against (the honest ≥20%)

1. **Self-declared age is theatre against a motivated minor.** A 12-year-old who
   wants the airtime just clicks "born 2004". The gate stops *silent, unflagged*
   processing and evidences good faith, but it does **not** actually verify age —
   so we should be honest that its POPIA value is procedural, not a real barrier.
   If a regulator expected meaningful verification (they don't, for this risk
   class — but *if*), this wouldn't satisfy them, and we'd have added friction for
   little protection.
2. **It's friction on the one screen we most want frictionless.** Every added
   signup field costs conversions, and this adds a step (and, for minors, a whole
   panel) right before the first identified play. We mitigate by keeping Journey +
   the first board ungated, but the *daily habit* (the retained behaviour) now
   costs one more tap to start. That is a real activation tax for a compliance win
   the median 25-year-old player gets nothing from.
3. **The guardian branch is unverifiable and easily self-served.** The "guardian"
   who ticks the box is very often the child. We record a name and a timestamp that
   may be fiction. It satisfies the *form* of §35 while its *substance* (a real
   parent actually deciding) is unenforceable — a fig leaf we should not oversell
   internally.
4. **New sensitive-ish data + a money-path change for a pre-launch base of ~zero.**
   We add age + guardian fields (more to secure, more to breach, more to delete on
   request) and touch the draw-entrant query (the one place real value moves) — for
   a pilot that currently has no users. The *legal* need is real regardless of user
   count; the *engineering value* is deferred until there are minors to protect.
5. **Copy is a legal liability surface.** Guardian-consent wording that's wrong
   (over-promising, or implying the prize is available to minors) is worse than
   none. This can't ship on an engineer's draft — it hard-blocks on counsel, which
   means the code can be ready and still not launchable.

**Honest recommendation from this section:** unlike RFC-0005, this is **not
optional and not sequencable away** — it's a stated non-negotiable and a genuine
legal gate, so it must exist before any public launch that admits under-18s. But
build the **smallest defensible version** (self-declared birth year, guardian
affirmation, prizes 18+ enforced) and **do not oversell it** as age *verification*.
The single hardest dependency is not code — it's **SA counsel signing off the
approach and the guardian copy**; ship the flow behind that sign-off, not before.

## Decision

**Design accepted; implementation gated on SA-counsel sign-off of the age-gate
approach + guardian copy.** Adopt the minimal self-declared birth-year gate with a
guardian-consent branch and enforced 18+ prize eligibility. Because this is a legal
non-negotiable (not a growth bet), it is **not** sequenced behind a user threshold
the way RFC-0005 is — it blocks public launch. **Judged by**
([`../ANALYTICS.md`](../ANALYTICS.md)): signup completion rate through the age step
(activation guardrail — watch for an outsized drop), and zero known-minor accounts
without a recorded `guardian_consent_at`. Revisit if activation craters or counsel
requires a stronger mechanism.

## Hand-off checklist for the IDE (when the build is greenlit)

- [ ] `supabase/migrations/0006_age_consent.sql` — `birth_year` + `guardian_consent_at` + `guardian_name` on `profiles`; keep `is_minor` derived, not stored.
- [ ] Age step (year picker) in the signup `profile` step; conditional guardian panel for derived age < 18.
- [ ] `/api/profile/consent`: accept + validate `birthYear`; when age < 18 require `guardianName` + `guardianConsent`, set `guardian_consent_at`. Reject a minor consent missing the guardian block.
- [ ] Enforce 18+ on **draw entrant selection** (not just copy) — a minor's solve counts for streaks/journey, never the airtime draw.
- [ ] Guest flow: decide age handling for guests (guests can't win prizes; still record birth year at guest→named upgrade, or gate guest play to 18+ — resolve with counsel).
- [ ] Legal: SA counsel sign-off on the age-gate approach + guardian copy **before** enabling in prod; keep records per CPA (3 years).
- [ ] `npm test` && `npm run lint` && `npm run build` (+ `supabase db push`); flip PHASE-TRACKER / PROJECT_STATUS + the README launch checklist.
