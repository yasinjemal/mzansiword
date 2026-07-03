# Game Feel Roadmap

Goal: make Mzansi Word feel like a native, engine-built game — realistic light,
physical motion, alive scenes — while staying a fast-loading PWA that runs well
on entry-level Androids over mobile data.

## Hard rules (every pillar must respect these)

- **No heavy engines.** No Unity/Unreal/three.js exports. The instant-play PWA
  link is the growth loop; a 30 MB bundle kills it.
- **Perf budget:** each pillar adds ≤ ~10 KB gzipped JS unless the decision log
  says otherwise. Animations use `transform`/`opacity` only.
- **`prefers-reduced-motion` always respected** — effects no-op, game stays fully playable.
- **Decorative only.** Every effect layer is `pointer-events: none` and
  `aria-hidden`; gameplay never depends on it.

## Pillars

| # | Pillar | Status |
|---|--------|--------|
| 1 | FX particle layer (bursts, coin-fly, shockwaves, trace trail) | ✅ Done |
| 2 | Parallax 2.5D chapter scenes (gyro + pointer, twinkle/breathe) | ✅ Done |
| 3 | Rive animated mascot + hero animations | ⬜ Todo |
| 4 | Spring physics motion + richer haptics | ✅ Done (device timing pass pending) |
| 5 | Shader sky (animated dusk, clouds, god rays) | ✅ Done |
| 6 | Bonus: Capacitor native wrap (Play Store, push, native haptics) | ⬜ Later |

---

### 1. FX particle layer — ✅ Done

**What:** A fixed, transparent canvas over the whole app with a tiny
zero-dependency particle engine ([src/lib/fx.ts](src/lib/fx.ts), mounted by
[src/components/FxLayer.tsx](src/components/FxLayer.tsx)). Additive blending
(`globalCompositeOperation: "lighter"`) gives the glowy "engine" look.

**Wired events:**
- Word lands in grid → gold sparkle burst over the grid
- Bonus word → sparkles + coins that arc physically into the coin chip
  (targets `[data-fx="coins"]`)
- Level / chapter complete → shockwave ring + big burst
- Letter wheel: sparkle trail follows the finger; letters pop when caught

**Decision log:** implemented with canvas 2D + pre-rendered sprites instead of
PixiJS. At our particle counts (≤ ~150 live) canvas 2D holds 60 fps on low-end
devices and costs 0 KB of dependencies vs ~100 KB. The `fx.*` emitter API is
the stable boundary — **upgrade trigger:** if we ever want shader-based
effects or >1k simultaneous particles, swap the engine behind `fx.*` for
PixiJS without touching call sites.

**Not yet wired (nice-to-haves):** daily-game win row, hint reveal sparkle on
the revealed cell, key-press dust on the daily keyboard.

### 2. Parallax 2.5D chapter scenes — ✅ Done

**What:** [JourneyBackdrop](src/components/journey/JourneyBackdrop.tsx) is now
layered — stars, sun glow, far ridge, chapter art, near ridge — each moving at
a different depth in response to device tilt (gyroscope) and pointer position
([src/lib/useParallax.ts](src/lib/useParallax.ts) writes `--px/--py`; layers
apply `translate3d(calc(var(--px) * -depth))` and are slightly overscaled so
edges never show). Stars twinkle and the sun glow breathes on slow loops
(opacity-only keyframes `fx-twinkle` / `fx-breathe` in globals.css) so scenes
feel alive even with no sensor input.

**Notes:** iOS requires a user-gesture permission for gyro — we intentionally
don't prompt; iOS falls back to pointer + idle animation. Landing/map
`ChapterScene` cards stay static (scroll perf) — revisit if we want tilt there.

### 3. Rive mascot — ⬜ Todo

**What:** An original animated character (springbok / meerkat direction) built
in [Rive](https://rive.app) with a state machine: idle, watching trace,
celebrate (level clear), streak hype, sleepy (idle timeout). Rive runtime is
~40 KB + a 20–100 KB `.riv` file; renders to its own small canvas.

**Where it appears:** level-complete card first (biggest emotional beat),
then journey map header, then daily-game result panel.

**Done when:** mascot reacts to at least 4 game states; file budget ≤ 150 KB
total; reduced-motion shows a static pose.

**Prereq:** design the character (Rive editor is manual work — needs a human
or commissioned artist; code side is trivial once the .riv exists).

### 4. Spring physics motion + haptics — ✅ Done

**What shipped:** hand-rolled springs, 0 KB of dependencies, two mechanisms:

- **JS springs** ([src/lib/spring.ts](src/lib/spring.ts)): a damped harmonic
  oscillator sampled into Web Animations API keyframes (the Motion One
  technique). `springEnter` drives the level-complete card entrance;
  `springPop` drives the coin chip bump on every earn.
- **CSS spring-release curves** (globals.css): presses are fast/eased, but
  releases use overshooting `cubic-bezier(0.32, 1.75, 0.45, 1)` so buttons,
  keyboard keys, wheel letters, hint chips, and map cards (`.press-spring`)
  snap back with a physical wobble. The trace selection pill mounts with
  `.animate-spring-in`.

**Haptics:** added an 8 ms tick each time the trace catches a wheel letter,
on top of the existing word/complete/invalid patterns in
[src/lib/celebrate.ts](src/lib/celebrate.ts).

**Remaining:** timing constants (stiffness/damping, bezier overshoot) deserve
a feel pass on a real low-end Android — tune in `spring.ts` and the
`.press-spring`/button transitions in globals.css.

### 5. Shader sky — ✅ Done

**What shipped:**
[ShaderSky.tsx](src/components/journey/ShaderSky.tsx) — one fragment shader,
raw WebGL, zero dependencies, layered between the CSS gradient fallback and
the parallax layers in the journey backdrop. Slow gradient drift, drifting
fbm clouds in the mid-sky band, and a sun halo with slowly turning god rays,
all in the chapter palette (stars stay in the parallaxed SVG layer — no
duplication).

**Perf/battery decisions:** renders at 0.6× CSS resolution and ~30 fps (the
sky is soft and slow; upscaling is invisible), `powerPreference: "low-power"`,
pauses on `visibilitychange`, **pauses when the chapter's drop-in art has
fully faded in over it** (its main runtime role is covering the seconds while
~150 KB art loads, plus any chapter shipped before its art exists), and
reduced-motion renders exactly one still frame. No WebGL / compile failure /
context loss → canvas never fades in and the CSS gradient stands.

**Possible follow-up:** god rays *above* the chapter art via a second canvas
with `mix-blend-mode: screen` — additive light works over paintings; clouds
don't. Try only if the art still feels too static.

### 6. Capacitor native wrap — ⬜ Later

Wrap the finished PWA with Capacitor for a Play Store listing: native haptics
(`@capacitor/haptics`), push notifications for streaks, splash screen. Zero
rewrite — same Next.js app. Do this only after pillars 1–5 and the pilot
launch checklist (Supabase project, OTP, isiXhosa review) are done.

---

## How we work this list

One pillar per PR/session. Update the status table + pillar section in this
file in the same change. Every pillar gets verified on a real phone (or at
minimum driven headless via Playwright at 414×896) before it's marked ✅.
