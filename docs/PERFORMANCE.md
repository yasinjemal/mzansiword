# PERFORMANCE.md

**Owner:** Performance Engineer · **Canonical:** [Bible §15.1](./GAME-DESIGN-BIBLE.md#15-technical-architecture), [`../GAME-FEEL.md`](../GAME-FEEL.md)

Performance is a **growth strategy, not fussiness** (Principle 4). The barrier in
South Africa is data cost, not devices (~$1.18/GB, punitive in small bundles;
[`RESEARCH-2026.md`](./RESEARCH-2026.md)). Every kilobyte saved is a player
retained. Build for the cheapest Android that ships; iOS comes free.

## The budget (hard limits)

- **≤ ~10 KB gzipped per feature.** A feature over budget is redesigned, not waved
  through.
- **Animate `transform` / `opacity` only** — no layout-thrashing properties.
- **60 FPS** on entry-tier Android.
- **Synthesized audio, zero audio files** (`sound.ts`).
- **Canvas FX, not PixiJS/heavy engines** (`fx.ts`).
- **`prefers-reduced-motion` respected** everywhere (also an accessibility
  requirement — [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)).
- **Cache-first, offline-tolerant** for everything non-prize.

## Why the discipline is already right

`fx.ts`, `sound.ts`, `spring.ts`, `useParallax.ts`, `ShaderSky.tsx` deliver game
feel within budget (see GAME-FEEL.md A–C). No heavy dependencies in `package.json`
(canvas-confetti is the only feel library). Defend this against feature pressure.

## Measurement, not guessing

- Verify on a **real low-end Android** where possible; else headless at 414×896.
- Track bundle KB per route, FPS during FX, TTI/cold-start, and cache hit rate
  ([`ANALYTICS.md`](./ANALYTICS.md)).
- Every performance decision is measured; nothing is assumed.

## The native-wrap note

Capacitor is deliberately **last** (Bible §15.3, GAME-FEEL Phase D) — it adds
native haptics and push with zero rewrite, but only after the PWA and pilot
checklist are done. A native shell does not excuse a heavy payload.

## KPIs

Bundle KB per feature (≤10), sustained FPS on low-end Android (≥60 target),
cold-start TTI, cache hit rate, data-per-session.
