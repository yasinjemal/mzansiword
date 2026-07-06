# MzansiWord — Build Phase Tracker

**Last updated: 2026-07-06** · Companion to [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md)

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

> **Just shipped: Streak shields — Slice B1 (RFC-0002)** (2026-07-06). Every
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
> **Next slice:** friend challenges (WhatsApp "beat my score"), or B2 repair **only
> if** B1 data shows week-one lapses that 2 shields don't catch (don't build blind).

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
| **Unified cross-mode streak** | 🟡 | **Slice A shipped (RFC-0001, 2026-07-06):** Journey completion now advances the same profile streak via `update_streak_on_solve`; shared spec `src/lib/streak/streak.ts` (+6 tests, node-verified 6/6). **Left:** run `npm test`/`build` locally; optional — thread returned `streak` into the Journey completion UI. |
| Streak shields (2 free for new players) | 🟡 | **Slice B1 shipped (RFC-0002, 2026-07-06):** `profiles.streak_shields` (migration `0005`, default 2 + backfill); shield-aware `update_streak_on_solve` bridges short gaps (single atomic UPDATE preserved); shared spec + 6 tests (TS == SQL); `streak_shield_used` telemetry (both modes); `ShieldPips` indicator + "Streak saved!" moment. Grant-only, never sold. **Left:** run `npm test`/`build` + `supabase db push` locally; watch shield-cohort D30 (churn-masking guardrail). |
| Free effort-based streak repair | ⬜ | **Slice B2 — held** (RFC-0002 decision). Reclaim a missed day by solving extra puzzles in a window. Build **only if** B1 data shows lapses 2 shields don't catch; columns intentionally not yet added. No purchase path. |
| "Perfect Week" gold state | 🟡 | **Shipped v1 (RFC-0003, 2026-07-06):** repeating no-reward gold card at every whole-week streak multiple past day 7 (14/21/28…), both modes, client-authoritative (reads returned `streak`, zero backend); pure `isPerfectWeek` + tests, `perfect_week` telemetry, deduped vs Signature Moments (milestone wins). **Left:** watch dismiss-rate (anti-wallpaper guardrail); **v2 shield-refill HELD** behind RFC-0002 B1 data. |
| **Signature Moments system (~6–8)** | 🟡 | **Engine + both game modes shipped & execution-verified.** `src/lib/signature/*` (catalog, pure detection + tests, client+server store), `SignatureMomentCard`, migration `0004`, `/api/signature`. Wired into the daily solve (`Game.tsx`) **and** Journey completion (`JourneyGame.tsx`, `authed` threaded from the level page). 13 active moments fire (first-solve, clutch/hole-in-one, streak 7/30/100/365, words 100/500/1000, chapter/journey-50). **Left (future phases):** promote the 4 `planned` moments (province-first, school #1, collections, Grade-5 vocab) once leaderboards + word categories exist. |
| Signature-moment share cards | ✅ | `signature/share.ts` + `SignatureMomentCard` emit a spoiler-free WhatsApp card per moment. |
| Friend challenges ("beat my score") | ⬜ | WhatsApp deep-link into today's puzzle; reuse share infra. |
| First-minute (60-second rule) audit | ⬜ | Verify no new feature gates the opening win (Bible §4). Standing check each slice. |
| **Pilot launch checklist** | 🟡 | Legal pages exist as placeholders (`/rules`, `/privacy`); isiXhosa is DRAFT; needs native-speaker review, attorney pass, prod puzzle scheduling (see README "Before public launch"). |
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
- **Verify by playing** — real low-end Android ideally, else headless at 414×896 (GAME-FEEL.md).
