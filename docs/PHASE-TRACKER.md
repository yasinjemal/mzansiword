# MzansiWord — Build Phase Tracker

**Last updated: 2026-07-08** · Companion to [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md)

This is the living build log: what's shipped, what's in progress, what's left.
Update it in the *same commit* as the work it describes (same rule as
[`GAME-FEEL.md`](../GAME-FEEL.md)).

### Legend
- ✅ **Done** — shipped and verified
- 🟡 **Partial** — some of it exists; notes say what's missing
- 🔨 **In progress** — actively being built now
- ⬜ **Not started**
- 🧭 **Business/partnership** — not a code task (deal, review, content)

### How to update
1. Change the status emoji and the "Notes" cell when a slice lands.
2. Move the **Current focus** pointer (below) when you start the next slice.
3. Bump **Last updated**.
4. Keep it honest — 🟡 is more useful than an optimistic ✅.

---

## 🧭 Current focus

> **Just shipped: Perf-budget measurement + a 62 KB login/me diet** (2026-07-08).
> The ≤10 KB/feature budget (a standing rule) had never been measured — Next 16
> stopped printing First Load JS, so the dashboard carried "TBD". Built
> `npm run perf-budget` (`scripts/perf-budget.ts`): gzips the real chunks from
> each route's client-reference manifest, prints first-load / route-only / CSS
> per route against the budget. **First real numbers found a real problem:**
> `/login` (64.8 KB route-only) and `/me` (62.6 KB) were shipping the entire
> supabase-js client in first paint — `/me` just for the Sign out button's
> click handler. Fixed with dynamic imports (login warms the chunk post-mount
> so submit isn't slowed on 3G): now **2.6 KB and 0.4 KB**. Verified by playing
> (Playwright): OTP submit reaches supabase through the lazy chunk and errors
> gracefully (live OTP needs the user's Supabase/Twilio setup). Remaining ⚠:
> `/journey/[track]/[level]` at 17.2 KB route-only — the whole Journey mode on
> one page (several features), acceptable but the page to watch. Shared
> baseline is 151 KB gz (framework+layout — outside the per-feature rule,
> real first-visit data cost). 120 tests, lint, build green. **Honest limits:**
> FPS on low-end Android still unmeasured; "route-only" is an upper bound per
> feature, not a per-feature attribution.
>
> ---
>
> **Prev: Colour-blind symbol mode — always-on** (2026-07-08). Closed
> the named follow-up from the two a11y passes: tile/keyboard state still
> reached sighted colour-blind players through hue alone, and green-vs-gold is
> exactly the deutan/protan confusable pair (~5–8% of boys — the schools
> audience). Every "correct" tile/key now also carries a small dark **dot**,
> every "wrong spot" a **diamond**, "not in word" carries nothing — pure CSS
> `::after` (~0.6 KB, zero DOM/JS/state), fading in at the flip midpoint with
> the colour and collapsing under `prefers-reduced-motion`. Chose **always-on
> over a settings toggle** deliberately: toggles have a discovery problem
> (colour-blind kids don't go looking) and don't persist on shared school
> devices; cost is a small permanent glyph on everyone's board. How-to-play
> legend now names the marks; `/dev/preview` gained a board+keyboard glyph
> panel. Verified by playing headless at 414×896 (Playwright): glyphs render on
> board + keys, shapes/opacity confirmed via computed styles. 120 tests, lint,
> build green. **Honest limits:** not validated with real colour-blind players
> (6.4px glyphs may be *too* subtle — watch feedback); the WhatsApp share
> emoji grid (🟩🟨⬛) is still colour-coded (universal convention, receiver
> isn't playing); Journey target-hint cells remain pointer-only.
>
> ---
>
> **Prev: Journey accessibility** (2026-07-08). Extended the a11y pass to
> the Journey (letter-wheel crossword). Gaps found + fixed: (1) results were
> visual-only → a polite `aria-live` region now announces every outcome ("Found
> STONE", "Bonus word GEM, plus five", "…is not a word here") and completion; (2)
> the wheel's keyboard/SR input path was undiscoverable → an sr-only instruction
> now lists the letters + controls (type / Enter / Backspace / Escape); (3) added
> `role="group"` labels to the wheel ("Letter wheel") and grid ("Crossword, N of M
> words found"). Known follow-ups: target-hint cells stay pointer-only (the
> random-hint button is the keyboard path), and a colour-blind *visual* symbol mode
> is still open. 120 tests, lint, build green. **Honest limit:** ARIA-pattern +
> build/type verified, not a live screen-reader pass.
>
> ---
>
> **Prev: Accessibility fix — daily board is no longer colour-only**
> (2026-07-08). Audited a11y (a standing non-negotiable) and found the classic
> word-game trap: tile + keyboard state (correct / wrong spot / not in word) was
> conveyed by **colour alone** — invisible to colour-blind and screen-reader
> players, a real barrier for the schools/education audience. Fix: a shared
> `MARK_LABEL` (`engine/score.ts`) now drives `aria-label`s on every revealed tile
> (`role="img"`) and on keyboard keys (state included), plus a polite `aria-live`
> region in `Game.tsx` that announces each resolved guess ("Guess 2: S correct, T
> wrong spot…"). Zero visual change; screen-reader + colour-blind players can now
> perceive results. 120 tests, lint, build green. **Honest limit:** validated by
> build/types + ARIA-pattern review, not a live NVDA/VoiceOver/TalkBack pass.
> **Follow-up:** Journey letter-wheel/grid a11y + a colour-blind *visual* symbol
> mode (this slice covers programmatic a11y for the daily prize loop).
>
> ---
>
> **Prev: First-minute (60-second rule) audit + daily guest fix**
> (2026-07-07). Ran the never-done Principle-4 standing check across the real
> entry→first-play paths. Result: the 60-sec rule **passes at the product level** —
> Journey is fully ungated and client-authoritative (a new user wins offline with
> zero sign-in), and **no shipped feature added a gate**. The one rough edge: an
> unauthed **daily** player could type a whole guess and then get bounced to login
> (the daily solve must be server-checked for draw integrity, so it needs an
> account — but the ambush was avoidable, and it's on the friend-challenge growth
> path). Fix: a compact upfront sign-in line on the daily board that also surfaces
> the no-sign-in Journey (`Game.tsx`). 120 tests, lint, build green. Ungated,
> launch-relevant, minimal — held off RFC-0006 (counsel-gated) and the held feature
> work (referral/B2/PW-v2).
>
> ---
>
> **Prev: Offensive-word filter + content pipeline** (2026-07-06). Built
> the profanity/slur screen (`src/lib/wordlist/safety.ts`, 7 tests) — whole-word
> exact match (no Scunthorpe false positives), no leet machinery (curated lists,
> not adversarial input), and it **reports its own coverage** so an empty
> per-language list can't masquerade as a working control. Wired into the two gates
> that matter: `approve-words` refuses to approve a blocklisted word (daily), and
> `generate` excludes them from the pool + re-checks in `validateLevel` (Journey).
> Execution-verified: a dry run caught a slur, refused to apply, and printed the
> honest "0 xh terms — don't trust this yet" warning. Documented the whole content
> lifecycle in [`CONTENT_PIPELINE.md`](./CONTENT_PIPELINE.md). **120 tests**, lint,
> build green. Deliberately did **not** build the economy/sponsor simulators or the
> doc reorg — premature pre-launch (right systems, wrong order).
>
> ---
>
> **Prev: Launch-readiness audit + first fixes** (2026-07-06). Audited the
> real launch surfaces (legal pages, consent flow, schema, scheduler, wordlists) —
> not the checklist's self-assessment. Findings: **(1)** POPIA guardian consent for
> under-18s is entirely unbuilt (the standing #1 principle) → wrote
> [RFC-0006](./RFC/0006-age-gate-guardian-consent.md) (design accepted, build gated
> on SA-counsel copy sign-off); **(2)** both tracks ship DRAFT with **no approval
> tool** (English too) → built `npm run approve-words` (pure planner
> `src/lib/wordlist/review.ts` + 7 tests, dry-run-by-default CLI, audit-logged) and
> repointed the review checklist off hand-SQL; **(3)** README launch list was
> missing blockers → expanded. Toolchain green (**113 tests**, lint, build); the
> approve-words dry run is execution-verified. **No new runtime feature** — design
> + ops tooling + honesty fixes.
>
> ---
>
> **Prev: Verification pass + Unified-streak completion-UI polish**
> (2026-07-06). Ran the full toolchain on a real machine — `npm test` **106/106**,
> `npm run lint` **clean** (fixed a stale unused-import warning), `next build`
> **green** — closing the "couldn't run in the sandbox" caveat carried by Slices
> A/B1/Perfect-Week/Challenges. Then finished the RFC-0001 Slice A leftover: the
> Journey `CompleteCard` now shows the unified `streak` inline (flame line, a
> `role="status"` "Streak saved!" line when a shield bridged a gap, and
> `ShieldPips`), matching the daily `ResultPanel`; the `/api/journey/complete`
> route now returns `shields` too. **Referral (RFC-0005) deliberately NOT built** —
> its own Decision gates the build on a minimum active-user threshold and we're
> pre-launch (zero users); building the heaviest, most abuse-prone Phase-1 system
> before there's anyone to refer from would violate the RFC + the self-critique
> rule. Growth keeps riding the shipped share-card + friend-challenge loops.
>
> **Next slice:** hold referral until the pilot has a base worth referring from;
> until then, launch-readiness (isiXhosa review, legal attorney pass, prod puzzle
> scheduling, `supabase db push`) is the real critical path — mostly user/business
> tasks. B2 repair + Perfect-Week v2 stay held pending B1 data (don't build blind).
>
> ---
>
> **Prev: Streak shields — Slice B1 (RFC-0002)** (2026-07-06). Every
> player holds up to 2 shields; the shield-aware `update_streak_on_solve`
> (migration `0005`) auto-consumes them to bridge short gaps instead of resetting
> the streak — forgiving early, strict late (a gap larger than the shields held
> still resets). Kept a **single atomic UPDATE** so the RFC-0001 concurrency
> guarantee holds; the pure spec `src/lib/streak/streak.ts` gained matching shield
> logic + 6 new tests (TS == SQL). `streak_shield_used` telemetry fires from both
> modes; shield indicator (`ShieldPips`) on the profile + daily result panel, with
> a `role="status"` "Streak saved!" moment. **B2 (repair) held** pending B1 data,
> per the RFC decision — its columns were deliberately NOT added.
>
> **Verification (honest):** the pure streak algorithm (incl. shields) is
> execution-verified via standalone Node. `npm test` / `tsc` / `next build` and
> `supabase db push` **could not run in the sandbox** — same documented cause as
> before (Windows-native vitest/rolldown binary; tsc reads a stale mount view).
> **Run `npm test`, `npm run lint`, `npm run build` and push migration `0005`
> locally to confirm** before prod.
>
> **Prev slice:** Unified cross-mode streak — Slice A (RFC-0001, 2026-07-06):
> Journey completion advances the same profile streak as a daily solve.
>
> **Also shipped: Perfect Week — v1 (RFC-0003)** (2026-07-06). A repeating gold
> pride state at every whole-week streak multiple past day 7 (14/21/28…), in both
> modes, client-authoritative and reward-free (no backend, no migration), deduped
> against Signature Moments. v2 (shield refill) is HELD behind B1 data.
>
> **Also shipped: Friend challenges — v1 (RFC-0004)** (2026-07-06). A stateless,
> spoiler-free, reward-free "beat my score" challenge carried entirely in the
> deep-link URL — token codec + head-to-head + "Send it back", both tracks, no
> backend. Dynamic-OG preview deferred.
>
> **Next slice:** double-sided referral (SOCIAL-VIRAL #2, the higher-K social bet
> challenges front-ran), or B2 repair **only if** B1 data shows week-one lapses
> that 2 shields don't catch (don't build blind).

---

## Foundation — already shipped (pre-tracker)

The pilot game already exists and works. This is the base every phase builds on.

| Area | Status | What's in the repo |
|---|---|---|
| Daily prize game (Wordle-style, server-validated) | ✅ | `/api/guess`, `/api/puzzle/today`, `/api/play/state`, `engine/score.ts`, `Board/Game/Keyboard/ResultPanel` |
| Nightly airtime draw (CPA s36, auditable) | ✅ | `/api/cron/daily-draw`, `draw/rng.ts`, `draw/select.ts`, `run-draw.ts`, `npm run verify-draw` |
| Prize claim + payout | ✅ | `/api/prize/claim`, `claim/[prizeId]`, `payout/manual.ts`, `payout/provider.ts` |
| Admin console | ✅ | `/admin` draws, flagged, prizes, stats + `/api/admin/action` |
| Journey mode (WoW-style, offline, client-authoritative) | ✅ | `journey/generate·layout·reducer·economy·loader`, `LetterWheel`, `CrosswordGrid`, `JourneyGame`, `JourneyMap` |
| Daily streak (daily game only) | ✅ | `profiles.current_streak` / `best_streak`, set in `/api/guess` |
| Spoiler-free WhatsApp share card | ✅ | `share.ts` (`buildShareText`, `whatsappShareUrl`) — emoji grid + streak |
| Profile + POPIA consent | ✅ | `/api/profile/me·guest·consent`, `profiles` table |
| Event tracking | ✅ | `/api/track`, `track-event.ts`, `events` table (migration 0003) |
| Device fingerprint (anti-cheat seed) | 🟡 | `lib/fingerprint.ts` exists; not yet wired to tournament scoring |
| Game feel (FX / sound / spring / parallax / shader sky) | ✅ | `fx.ts`, `sound.ts`, `spring.ts`, `useParallax.ts`, `ShaderSky.tsx` (see GAME-FEEL.md A–C) |
| Mzansi Moments (SA vignettes every 5th level) | ✅ | `MzansiMoment.tsx`, `journey/moments.ts` — *note: different from Signature Moments (Phase 1)* |

---

## Phase 1 — Unify & harden the habit (Bible §17 Q1)

*Goal: one player, one identity, one streak — and the affection layer that makes returning worth it.*

| Slice | Status | Notes / what's left |
|---|---|---|
| **Unified cross-mode streak** | ✅ | **Slice A shipped (RFC-0001, 2026-07-06):** Journey completion advances the same profile streak via `update_streak_on_solve`; shared spec `src/lib/streak/streak.ts` (+6 tests). **Completion-UI polish (2026-07-06):** the returned `streak`/`shields`/`shieldUsed` now render inline on the Journey `CompleteCard` — flame streak line, a `role="status"` "Streak saved!" line when a shield bridged a gap, and `ShieldPips` — mirroring the daily `ResultPanel` (chose inline over a new overlay card: matches daily + avoids celebration wallpaper). Route returns `shields`. Verified: `npm test` 106/106, `lint`, `build` all green locally. |
| Streak shields (2 free for new players) | 🟡 | **Slice B1 shipped (RFC-0002, 2026-07-06):** `profiles.streak_shields` (migration `0005`, default 2 + backfill); shield-aware `update_streak_on_solve` bridges short gaps (single atomic UPDATE preserved); shared spec + 6 tests (TS == SQL); `streak_shield_used` telemetry (both modes); `ShieldPips` indicator + "Streak saved!" moment. Grant-only, never sold. **Left:** run `npm test`/`build` + `supabase db push` locally; watch shield-cohort D30 (churn-masking guardrail). |
| Free effort-based streak repair | ⬜ | **Slice B2 — held** (RFC-0002 decision). Reclaim a missed day by solving extra puzzles in a window. Build **only if** B1 data shows lapses 2 shields don't catch; columns intentionally not yet added. No purchase path. |
| "Perfect Week" gold state | 🟡 | **Shipped v1 (RFC-0003, 2026-07-06):** repeating no-reward gold card at every whole-week streak multiple past day 7 (14/21/28…), both modes, client-authoritative (reads returned `streak`, zero backend); pure `isPerfectWeek` + tests, `perfect_week` telemetry, deduped vs Signature Moments (milestone wins). **Left:** watch dismiss-rate (anti-wallpaper guardrail); **v2 shield-refill HELD** behind RFC-0002 B1 data. |
| **Signature Moments system (~6–8)** | 🟡 | **Engine + both game modes shipped & execution-verified.** `src/lib/signature/*` (catalog, pure detection + tests, client+server store), `SignatureMomentCard`, migration `0004`, `/api/signature`. Wired into the daily solve (`Game.tsx`) **and** Journey completion (`JourneyGame.tsx`, `authed` threaded from the level page). 13 active moments fire (first-solve, clutch/hole-in-one, streak 7/30/100/365, words 100/500/1000, chapter/journey-50). **Left (future phases):** promote the 4 `planned` moments (province-first, school #1, collections, Grade-5 vocab) once leaderboards + word categories exist. |
| Signature-moment share cards | ✅ | `signature/share.ts` + `SignatureMomentCard` emit a spoiler-free WhatsApp card per moment. |
| Friend challenges ("beat my score") | 🟡 | **Shipped v1 (RFC-0004, 2026-07-06):** stateless spoiler-free challenge in the deep-link URL — token codec (`src/lib/challenge/*`, +19 tests incl. the no-letters invariant), `/p/[track]` preserves the query, pre-game banner + post-solve head-to-head + "Send it back", `challenge_sent/opened/completed` telemetry. Reward-free & client-authoritative (outcomes feed nothing with value). **Left:** dynamic-OG preview (stretch); end-to-end play verification; watch challenge-driven activation (draw-heavy score is the honest risk). |
| First-minute (60-second rule) audit | 🟡 | **Audited 2026-07-07:** home + middleware have no auth wall; **Journey is the genuine ungated 60-sec on-ramp** (client-authoritative, plays + wins offline, zero sign-in); **no newly-shipped feature gates the opening win** (streak/shields/challenges/Perfect-Week/consent are all post-solve/additive). One fix: the **daily** solve is server-checked (needs an account for draw integrity — the answer is never sent client-side), and a guest used to type a full guess then get bounced to `/login` — an ambush on the growth path (challenge deep-links land here). Added an upfront, non-jarring sign-in line on the daily board that also points to the no-sign-in Journey (`Game.tsx`). Re-run each slice. |
| **Pilot launch checklist** | 🟡 | **Audit 2026-07-06** found the README list under-reported blockers; now expanded. Open blockers: **(1) age gate + guardian consent for under-18s — NOT built** (POPIA §34–35, standing #1 principle; designed in [RFC-0006](./RFC/0006-age-gate-guardian-consent.md), gated on SA-counsel copy sign-off); (2) **no approved words** — both tracks ship DRAFT (English too), so no prod puzzles schedule until reviewed + approved — now unblocked by the `approve-words` tool + native review; (3) legal `[PROMOTER]` placeholders + attorney pass on `/rules`+`/privacy`. Watch: OTP send throttle (Supabase Auth) before a public link. |
| isiXhosa wordlist expansion | 🟡 🧭 | ~390-word draft → ~15 Journey levels. Native-speaker review + growth, then regenerate. **On critical path** (Bible §13.4). Continuous. |

---

## Phase 2 — Social retention (Bible §17 Q2)

*Goal: turn personal habit into social habit.*

| Slice | Status | Notes / what's left |
|---|---|---|
| **Weekly League (promotion/relegation)** | ⬜ | Cohorts ~30, weekly XP across both modes, top ~7 up / bottom ~5 down, visible relegation zone. No leaderboard tables exist yet. |
| Daily / weekly missions (player-chosen goals) | ⬜ | Coins/XP/cosmetic only, never advantage. |
| Rewarded-ad integration (hybrid mediation, 5+ networks) | ⬜ | Rewarded-only, capped faucet. First revenue line (Bible §14.1). |
| Intelligent notifications / WhatsApp reminders | ⬜ | Timed to player's habit; no guilt-shaming. Pre-native = WhatsApp opt-in. |

---

## Phase 3 — Competition & first sponsor (Bible §17 Q3)

*Goal: the keystone competitive mode + the load-bearing partnership.*

| Slice | Status | Notes / what's left |
|---|---|---|
| **Async score-attack mode** | ⬜ | Same puzzle, best score/time wins. Server-scored. Keystone for leagues/clubs/tournaments. |
| Ranked ELO / MMR + widening-window matchmaking | ⬜ | Persistent rating; fair matches at low density. |
| Clubs (school / province / workplace) + roles | ⬜ | Group identity engine; substrate for team races & tournaments. |
| Bi-weekly club races | ⬜ | Every member's daily play adds to a shared score. |
| First telco conversation (zero-rating + prizes) | 🧭 | **Highest-leverage deal in the plan** (Bible §11.1, §18.3). Pursue first & hardest. |

---

## Phase 4 — Platform seed & native wrap (Bible §17 Q4)

| Slice | Status | Notes / what's left |
|---|---|---|
| Tournament engine v1 (async score-attack + Swiss) | ⬜ | Reuses daily scoring; add scheduling + brackets. |
| Anti-cheat layer (stats anomaly + fingerprint wiring) | 🟡 | `fingerprint.ts` seeded; needs server-authoritative tournament scoring + anomaly detection (Bible §15/§16). |
| First branded / sponsored tournament | 🧭 | Retailer or telco. |
| Capacitor native wrap (Play Store + push) | ⬜ | Zero rewrite; last, per GAME-FEEL.md Phase D. |
| Cosmetic economy v1 (earn + first sellable SA themes) | ⬜ | Legal to sell — zero gameplay advantage (Bible §13/§14.3). |

---

## Year 2 — Platform & institution (Bible §17.2)

| Slice | Status |
|---|---|
| isiZulu launch (largest home language) | ⬜ 🧭 |
| Education platform v1 (free school core, teacher dashboard, mastery/reading analytics, certificates) | ⬜ |
| Sponsor dashboard (self-serve branded tournaments + ROI analytics) | ⬜ |
| School-vs-school / province-vs-province at scale | ⬜ |
| Subscription (MzansiWord Plus — depth/convenience/cosmetics only) | ⬜ |
| Season pass (cosmetic + earned-coin, break-even loop) | ⬜ |
| Real-time blitz duels (opt-in, density-gated) | ⬜ |
| Monthly championships; annual final planning | ⬜ |
| Full moderation stack (UGC/chat, SA languages) | ⬜ |

---

## Year 3–5 — National institution → African platform (Bible §17.3)

| Slice | Status |
|---|---|
| National championship + TV/radio + streamed spectator finals | ⬜ 🧭 |
| CSR/government education partnership at national scale (Siyavula model) | ⬜ 🧭 |
| Language expansion (all SA official → pan-African) | ⬜ |
| **Creator ecosystem** (teachers/universities/municipalities/tourism/museums/wildlife author packs) | ⬜ | Gated behind moderation + scale; invite-only pilot first (Bible §17.3). |
| Regional expansion (Nigeria, Kenya, Egypt) | ⬜ 🧭 |
| Assessment/certification product (African-language literacy) | ⬜ |

---

## Cross-cutting standing checks (every slice must respect)

- **No paid advantage, ever** — no purchase path for coins/hints/entry/power (CPA s36; Bible §1). Server-authoritative where money lives.
- **60-second rule** — never gate the first-minute win (Bible §4).
- **Perf budget** — ≤ ~10 KB gz per feature, `transform`/`opacity` only, `prefers-reduced-motion` respected (GAME-FEEL.md).
- **POPIA** — provable guardian consent for under-18s; data minimization (Bible §15.5).
- **Accessibility** — never colour-only (state needs text/ARIA too), one-thumb targets, screen-reader labels + live regions, plain language (Principle: colour-blind support). Daily board + Journey wheel/grid (programmatic) and the colour-blind visual symbol mode (dot/diamond glyphs, always-on) done 2026-07-08. Remaining: target-hint cells are pointer-only (random-hint button is the keyboard path).
- **Verify by playing** — real low-end Android ideally, else headless at 414×896 (GAME-FEEL.md).
