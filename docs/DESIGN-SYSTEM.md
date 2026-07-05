# DESIGN-SYSTEM.md

**Owner:** UI Designer + Art Director + Motion + Sound · **Canonical:** [`../GAME-FEEL.md`](../GAME-FEEL.md), [Bible §6.4](./GAME-DESIGN-BIBLE.md#6-progression-mastery--player-identity)

Think like Apple: every interaction, animation, sound, colour, transition,
vibration, popup, shadow, and delay must feel **intentional** — nothing generic,
random, or accidental. Think like Nintendo: optimize for *feelings*, not features.
And do it all inside the performance budget ([`PERFORMANCE.md`](./PERFORMANCE.md)).

## Design philosophy

Simple. Beautiful. Timeless. Fast. Accessible. Inclusive. Educational. Fun.
Social. Competitive. Shareable. Premium. Unmistakably South African.

## The craft rules

- **One screen, one primary question.** Each surface answers a single question the
  player has right now; everything else is secondary or hidden.
- **Clarity beats cleverness** (Principle). If a player must think about the
  interface, the interface failed.
- **Motion is meaning.** Animations communicate state and reward, `transform`/
  `opacity` only, always with a `prefers-reduced-motion` static path
  ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md)). Springs over linear tweens (`spring.ts`).
- **Audio is synthesized, zero files** (`sound.ts`) — a distinct, pleasant tone
  vocabulary for solve / bonus / streak / error, never annoying on repeat.
- **Feel is layered by priority:** A retention → B feel → C delight (GAME-FEEL.md).
  Never add delight before the thing is sticky.

## South African visual identity

Landmark tile skins, provincial colours, beadwork patterns, local-artist
collaborations, SA wildlife and landscapes (`JourneyBackdrop`, `ShaderSky`,
`ai-backdrop-prompts.md`). This is the cosmetic economy *and* the un-copyable moat
([`PROGRESSION.md`](./PROGRESSION.md)). Cultural representation must be respectful
and correct — review with local voices, never caricature.

## Component inventory (shipped)

`Board`, `Keyboard`, `ResultPanel`, `LetterWheel`, `CrosswordGrid`, `Header`,
`FxLayer`, `MzansiMoment`, `SignatureMomentCard`, `JourneyMap`, `ChapterScene`,
`CoinsChip`. Keep the set small and consistent; new components justify themselves.

## The parked decision

The **Rive mascot is correctly parked** — mascots don't move retention until
players already love the game. Revisit only after streak/league metrics are
healthy. Defend this against the temptation to make the game "cuter" before it's
sticky ([`DECISION-LOG.md`](./DECISION-LOG.md)).

## KPIs

FPS during animation, reduced-motion parity, share-card render correctness,
cosmetic equip rate, "feels premium" qualitative testing.
