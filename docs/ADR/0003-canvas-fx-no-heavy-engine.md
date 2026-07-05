# 0003 — Canvas FX + synth audio, no heavy engine

- **Status:** Accepted
- **Date:** 2026-07-06 (documenting an implemented decision)
- **Deciders:** Performance Engineer, Art Director
- **Relates to:** [`PERFORMANCE.md`](../PERFORMANCE.md); [Bible §15.1](../GAME-DESIGN-BIBLE.md#15-technical-architecture); [`../GAME-FEEL.md`](../../GAME-FEEL.md)

## Context

The game needs juice — particle bursts, celebrations, satisfying sound — but runs
on entry-tier Android over expensive, metered data ([`RESEARCH-2026.md`](../RESEARCH-2026.md)).
A game engine (PixiJS, Phaser, Unity/Unreal exports) or bundled audio files would
blow the ≤10 KB-per-feature budget and the instant-play WhatsApp-link growth loop.

## Decision

**Hand-rolled Canvas FX and fully synthesized audio; no rendering/game engine and
zero audio files.** Implemented in `fx.ts` (canvas particles), `sound.ts`
(Web-Audio synthesis), `spring.ts` (spring physics), `useParallax.ts`, and
`ShaderSky.tsx`. `canvas-confetti` is the only feel dependency.

## Consequences

- **Easier:** tiny payload, 60 FPS on cheap devices, no asset pipeline for audio,
  full `prefers-reduced-motion` control ([`ACCESSIBILITY.md`](../ACCESSIBILITY.md)).
- **Harder:** effects are coded, not authored in a tool, so complex set-pieces cost
  engineering time. Accepted — the budget is the growth strategy, and the current
  feel proves it's enough.

## Alternatives considered

- **PixiJS / Phaser** — rejected: tens–hundreds of KB for capability we don't need.
- **Bundled audio files** — rejected: data cost + download weight; synthesis is
  free and infinitely variable.
- **Lottie/Rive for FX** — rejected here (see also [ADR-0002](./0002-rive-mascot-parked.md)):
  runtime + asset weight against the budget.
