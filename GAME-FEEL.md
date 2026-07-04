# Game Feel & Retention Roadmap

Goal: make Mzansi Word impossible to put down — retention mechanics first,
visual fidelity second — while staying a fast-loading PWA that runs well on
entry-level Androids over mobile data.

Reprioritized 2026-07-04 after a real play session: the original pillar list
optimized visual fidelity before game feel. New order: **A retention →
B feel → C delight → D native**.

## Hard rules (every item must respect these)

- **No heavy engines.** No Unity/Unreal/three.js exports. The instant-play PWA
  link is the growth loop; a 30 MB bundle kills it.
- **Perf budget:** each item adds ≤ ~10 KB gzipped JS unless the decision log
  says otherwise. Animations use `transform`/`opacity` only.
- **`prefers-reduced-motion` always respected** — effects no-op, game stays fully playable.
- **Decorative only.** Effect layers are `pointer-events: none` and
  `aria-hidden`; gameplay never depends on them.
- **Economy is server-authoritative.** Celebration can escalate freely;
  coin *amounts* only change together with the server ledger logic.

---

## Phase A — Retention (make it impossible to put down)

| Item | Status |
|------|--------|
| A1. Word progress indicator + stuck nudges | ✅ Done |
| A2. Bonus words feel amazing | ✅ Done |
| A3. Word reveal satisfaction | ✅ Done |
| A4. Chain combo | ✅ Done (celebration; coin multiplier pending server work) |
| A5. Streak emotion | ✅ Done |
| A6. Sound redesign | ✅ Done |
| A7. Mzansi Moments | ✅ Done |

### A1. Progress + stuck nudges — ✅
The status line now always shows `found/total words` (plus bonus count), so
"how many are left?" is never a mystery. Stuck detection in
[JourneyGame](src/components/journey/JourneyGame.tsx): 30 s without finding a
word → the cells of one unfound word shimmer gently (`.jcell-nudge`); 60 s →
a one-time "a hint reveals a letter" toast and the hint buttons glow. Timers
reset on every found word; nothing fires before the player is actually stuck.

### A2. Bonus celebration — ✅
Bonus word now: gold screen flash (subtle, 0.14 alpha), floating "+5" text
particle, sparkle burst, coins arcing into the wallet, sparkle sfx. Combo
multiplies the spectacle (more coins/sparks, higher pitch), not the payout.

### A3. Word reveal — ✅
Each letter of a landed word pops into the grid with a spark micro-burst at
its cell (staggered with the fill animation) and the word glows gold for a
beat afterwards (`jcell-glow` keyframe).

### A4. Chain combo — ✅ (celebration)
`combo` lives in the pure reducer ([reducer.ts](src/lib/journey/reducer.ts)):
+1 per grid/bonus word, reset by an invalid word. From ×2 the toast announces
the combo, FX and sfx pitch escalate, and a flame chip shows in the status
line. **Coin multiplier is deferred:** wallet amounts are recomputed
server-side from `{bonusFound, hintsUsed}`, so a client-side multiplier would
be clawed back on sync. Do it together with the Supabase ledger work
(add `comboPeak` to `/api/journey/complete`, cap server-side).

### A5. Streak emotion — ✅
The header streak chip now reads "N-day" with a flickering flame (scale +
sway keyframes, terracotta on gold). Same treatment wherever streak appears.

### A6. Sound redesign — ✅
[sound.ts](src/lib/sound.ts) upgraded, still 100 % synthesized (zero files):
noise-layer engine added; word = soft *shh* + rising triad + low thump;
bonus = fast sparkle arpeggio; level complete = *shhh-boom* swell + chord;
chapter = big layered hit with cymbal-ish noise tail; combo raises the word
chord's pitch. Note: audio was wired all along — if it seems silent, check
the mute toggle (speaker icon, header) and device media volume; the old
sounds were also simply too thin, which this pass fixes.

### A7. Mzansi Moments — ✅
Every 5th completed level, tapping "Next level" first shows a full-screen
South African vignette — landmark scene + one-line fun fact, tap to continue
([MzansiMoment.tsx](src/components/journey/MzansiMoment.tsx), data in
[moments.ts](src/lib/journey/moments.ts): Table Mountain, Wild Coast, Karoo,
Namaqualand, Kruger, Drakensberg, Soweto, Joburg). Scenes are code-drawn
(palette + silhouette) with the same `/public/themes/moment-<id>.webp`
drop-in upgrade path as chapters. Progressing = traveling across the country.

---

## Phase B — Feel ✅ (all shipped)

| Item | Status |
|------|--------|
| B1. FX particle layer | ✅ |
| B2. Spring physics + haptics | ✅ (device timing pass pending) |
| B3. Parallax 2.5D scenes | ✅ |

- **B1** [fx.ts](src/lib/fx.ts) + [FxLayer.tsx](src/components/FxLayer.tsx):
  zero-dep canvas engine, additive blending, pre-rendered sprites. Bursts,
  coin-fly, shockwaves, trace trail, floating text, screen flash. Decision:
  canvas 2D over PixiJS (~0 KB vs ~100 KB; identical at our particle counts).
  Upgrade trigger: shaders or >1k live particles → swap engine behind `fx.*`.
- **B2** [spring.ts](src/lib/spring.ts): damped oscillator → WAAPI keyframes;
  CSS spring-release curves on buttons/keys/wheel/cards; haptic tick per
  caught letter. Tune stiffness/damping on a real low-end Android.
- **B3** [useParallax.ts](src/lib/useParallax.ts) + layered
  [JourneyBackdrop](src/components/journey/JourneyBackdrop.tsx): gyro +
  pointer depth, twinkle/breathe idle life.

## Phase C — Delight

| Item | Status |
|------|--------|
| C1. Shader sky | ✅ Done |
| C2. Rive mascot | ⬜ Deliberately parked |

- **C1** [ShaderSky.tsx](src/components/journey/ShaderSky.tsx): raw-WebGL dusk
  (drift, fbm clouds, god rays), 0.6× res @ ~30 fps, low-power GPU, pauses on
  hidden tab / when chapter art covers it, CSS gradient fallback. Possible
  follow-up: god rays *above* art via `mix-blend-mode: screen` canvas.
- **C2** parked on purpose: mascots don't move retention until players
  already love the game. Revisit after Phase A metrics look good. Needs a
  character designed in Rive (~40 KB runtime + 20–100 KB file) — idle /
  watching / celebrate / streak-hype / sleepy states.

## Phase D — Native wrap (last)

Capacitor wrap of the finished PWA for a Play Store listing: native haptics,
push notifications for streaks, splash screen. Zero rewrite. Only after
Phases A–C and the pilot launch checklist (Supabase project, Twilio OTP,
isiXhosa review, legal pages).

---

## How we work this list

One item (or tight group) per session. Update the status tables + section in
this file in the same change. Every item gets verified by playing — real
phone ideally, else driven headless via Playwright at 414×896 — before ✅.
