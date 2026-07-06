# RFC-0005 — Double-sided referral

- **Status:** Draft — for review before code.
- **Author / Deciders:** Growth Engineer, Backend Architect, Security Engineer,
  Community Manager. SOCIAL-VIRAL #2 ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md)).
- **Date:** 2026-07-06

## Problem

Share cards (shipped) seed awareness and friend challenges (RFC-0004) add a
return leg, but neither creates an **accountable inviter→invitee bond** — the
thing that actually compounds a viral cycle. There is no way for a player who
loves MzansiWord to *bring someone in* and for the game to notice they did. Growth
in SA is WhatsApp-forwarded links ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md));
double-sided referral is the canonical mechanism to turn that forward into a
tracked, rewarded activation — the K-compounding layer share cards can't be.

## Named emotion (Principle 6)

*"I brought my people in — and we both won something for it."* Generosity and
belonging — ubuntu, widening the circle — not a mercenary bounty.

## Research

- **Double-sided beats one-sided:** rewarding *both* parties is the durable
  pattern (Dropbox/PayPal lineage; [`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md) #2).
  One-sided gives the invitee no reason to finish.
- **Free-to-deliver rewards are the legal firewall:** rewards must be coins/
  cosmetics/shields — *never* cash, airtime, or draw entries — so farming yields
  nothing of real value and the CPA promotional-competition framing stays intact
  (Principle 1, [`../SECURITY-LEGAL.md`](../SECURITY-LEGAL.md); the coin faucet
  `award_journey_coins` is already "free-earned only" by migration 0002).
- **Aim K ≈ 0.4–0.6 with a fast daily cycle; sustained K > 1 is rare — don't plan
  on it** ([`../SOCIAL-VIRAL.md`](../SOCIAL-VIRAL.md)).
- **What NOT to build:** no address-book upload / friend-finder / follow graph
  (POPIA cost > value, §7.5). Manual WhatsApp share only.

## Proposal

**v1: a single-reward, activation-gated, capped double-sided referral.** One
reward type (**coins**), through the one server-authoritative faucet that already
exists, rewarded only on genuine activation.

### Attribution (link → signup → bind)
- Every profile gets a stable, random **`referral_code`** (short, not the uid).
- Referrer shares `…/j/<code>` (manual WhatsApp forward, RFC-0004 pattern). The
  `/j/<code>` route sets a first-touch **`mw:ref` cookie** and redirects to the
  home/play page (invitee plays immediately — 60-second rule, guest play works).
- On **account creation**, a server step reads the cookie, validates the code, and
  — if the new user has no `referred_by` and the code isn't their own — records a
  **`pending`** referral and sets `profiles.referred_by` (set once, immutable).

### Activation + reward (the gate)
- The referral flips to **`activated`** only when the invitee completes their
  **first qualifying action** (first daily solve or first Journey level — the same
  "genuine progress" signal the streak uses). Signup alone earns nothing.
- On activation, **both** get coins via `award_journey_coins` — invitee a welcome
  bonus, referrer a per-activation bonus **capped at N rewarded referrals** (e.g.
  10). `referral_activated` fires ([`../TELEMETRY.md`](../TELEMETRY.md)).

### Schema (migration `0006_referrals.sql`)
```
alter table profiles
  add column referral_code text unique,          -- stable share code
  add column referred_by  uuid references profiles(id),  -- set once, immutable
  add column referrals_rewarded smallint not null default 0;  -- faucet cap counter

create table referrals (
  id bigserial primary key,
  referrer_id uuid not null references profiles(id),
  invitee_id  uuid not null references profiles(id) unique,  -- one referrer per invitee
  code text not null,
  status text not null default 'pending' check (status in ('pending','activated')),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  check (referrer_id <> invitee_id)              -- no self-referral
);
-- RLS: referrer may SELECT their own referrals (for an "invites" screen); all
-- writes service-role only. Activation is one atomic, idempotent function.
```

### Rewards (v1, concrete but tunable)
- **Coins only** — bounded, CPA-safe, and the faucet already exists. Invitee gets
  a welcome bonus; referrer gets a per-activation bonus up to the cap. (A shield
  for the invitee would be ideal for the fragile week-one user, but they already
  start at the cap of 2 (RFC-0002), so it would be a no-op — coins it is.)

### Client
- An **invite screen** (`/invite` or a `/me` section): the player's link + one-tap
  WhatsApp share + "X friends joined" count. A small **invitee welcome** ("Sipho
  invited you — here's a coin bonus to start"). ~small KB.

## Cost

- **Backend (heaviest slice so far):** migration (2 columns + a table + RLS + an
  idempotent `activate_referral` function), a `/j/<code>` route + cookie, a
  post-signup **bind** step, and an **activation hook** in the guess + journey
  routes. This is materially more than RFC-0002–0004.
- **Client:** invite screen + share CTA + invitee welcome (~3–4 KB).
- **Maintenance:** the new abuse surface (self-referral farms) and attribution
  edge cases are the real ongoing cost.

## Accessibility

Invite link/CTA is text + icon, one-thumb, plain language; the invitee welcome is
a dismissible, reduced-motion-safe note (reuse `celebrate` helpers). No colour-only
state. The referred newcomer reaches a playable board with zero gating.

## Legal / safety

- **CPA s36 (Principle 1):** rewards are **coins only — never cash, airtime, or
  draw entries.** Referrals cannot buy or improve a prize-draw entry (entry = a
  solve, full stop), so no purchased/farmed advantage exists. This is the firewall.
- **POPIA:** no contacts access; the only new data is a two-user `referrals` link +
  a code — minimal, both parties consenting. Guardian consent for under-18s still
  gates play. `device_fp` (already on `profiles`) may inform a **soft** abuse
  signal, never a hard block (minimisation).
- **Abuse controls:** activation-gated (real play required), per-referrer cap,
  self-referral blocked by schema, one `referred_by` per account (immutable).

## Alternatives

- **A. One-sided (referrer only).** Rejected — invitee has no completion
  incentive; double-sided is the research-backed design.
- **B. Reward on signup, not activation.** Rejected — trivially farmable and pays
  for ghosts; the whole point of `referral_activated` is a real-play gate.
- **C. Contacts upload / friend-finder.** Rejected — POPIA + §7.5 "do not build".
- **D. Cash / airtime referral bonus.** Rejected — **illegal** here (CPA s36) and
  farmable for real value. Hard no.
- **E. Do nothing; lean on challenges (RFC-0004).** Challenges spread awareness but
  don't create the tracked inviter→invitee bond. This is the honest live option —
  see Case against.

## Case against (the honest ≥20%)

1. **Biggest backend + abuse surface in Phase 1, for the least-certain payoff.**
   Two tables/columns, cookie attribution, a bind step, an activation grant, RLS,
   and a *new* farming surface — versus RFC-0002–0004 which were mostly client-side
   or one migration. The legal firewall (free-to-deliver coins) means farming wins
   nothing of value, **but it still pollutes analytics with fake K and can drain the
   capped faucet.** Most complex thing we'd have shipped, guarding the numbers we
   most want to trust.
2. **We may be building it before there's anyone to refer *from*.** The pilot's
   base is tiny. Referral compounds with density; at low N it can barely move
   activation while share cards + challenges (already shipped, near-zero marginal
   cost) plausibly deliver more per unit of effort. **Sequencing risk: this could be
   a large system that sits idle until the base grows.**
3. **Coins under-reward the majority segment.** Coins are Journey-only currency; a
   daily-only referrer earns something they can't spend in the mode they play. The
   reward may simply not motivate the exact loyal player we want inviting others.
   The *ideal* reward (cosmetics) doesn't exist yet.
4. **Attribution is leaky and unprovable.** First-touch cookie capture is fragile —
   the WhatsApp in-app browser, cleared storage, iOS ITP, and an OTP/OAuth signup
   round-trip all drop referrals. Under-attribution → under-credit → "I invited them
   and got nothing" frustration, the opposite of the named emotion.
5. **New relationship data + minors.** A referral graph is social-graph-adjacent
   data we don't store today; even minimal, it raises the POPIA surface and needs
   extra care for under-18s.

**Honest recommendation from this section:** referral is the right *eventual*
layer, but it is **heavier and more abuse-prone than its likely early-stage K
payoff.** Prefer to **hold the build until the pilot has a base worth referring
from** (a concrete active-user threshold), and keep leaning on the shipped, cheaper
loops (share cards + challenges) until then. **If** we build now, ship the
*smallest* version only: coins-only, activation-gated, capped, `device_fp` as a
soft flag — and treat the RFC's schema as the contract so a later build is fast.

## Decision

**Design accepted; build sequenced.** Adopt this design, but **gate implementation
on a minimum active-user threshold** (referral needs density to pay for its
complexity + abuse surface). Until then, growth rides the shipped share card +
friend-challenge loops. When built, ship the minimal coins-only, activation-gated,
capped v1 above. **Judged by** ([`../ANALYTICS.md`](../ANALYTICS.md)): referral
**activation rate** (invited → first-solve) and net **K contribution** above the
challenge baseline — *not* invite-send volume. Kill or rethink if activation is low
or farming dominates the signal.

## Hand-off checklist for the IDE (when the build is greenlit)

- [ ] `supabase/migrations/0006_referrals.sql` — `referral_code` + `referred_by` + `referrals_rewarded` on `profiles`; `referrals` table + RLS; idempotent `activate_referral` grant function (capped).
- [ ] `/j/<code>` route: set first-touch `mw:ref` cookie, redirect to play (no gating).
- [ ] Post-signup bind: read cookie, validate (not self, not already referred), record `pending` + set `referred_by`.
- [ ] Activation hook in `/api/guess` + `/api/journey/complete`: on the invitee's first qualifying action, flip to `activated` and grant coins to both (respect cap).
- [ ] `friend_invited` / `referral_activated` telemetry (client whitelist + enum / server `logEvent`).
- [ ] Invite screen (link + share + joined count) + invitee welcome (reduced-motion).
- [ ] Abuse: self-referral blocked, per-referrer cap, `device_fp` soft flag; farming yields no real value (coins only, no draw entries).
- [ ] `npm test` && `npm run lint` && `npm run build` (+ `supabase db push`); flip PHASE-TRACKER / PROJECT_STATUS.
