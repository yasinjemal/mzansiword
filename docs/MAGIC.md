# MAGIC.md — The Moments Players Remember

**Owner:** Creative Director + Motion + Sound · **Related:** [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md), [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md)

> **Boundary (read first):** [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md) is the
> *system* of rare, named, shareable **milestones** ("100-day Ubuntu streak") —
> tracked in code, tiered, share-generating. **This file is the sensory
> choreography of in-the-moment delight — the "juice"** that makes a single solve
> *feel* alive. A signature moment often triggers a magic moment; they are not the
> same thing. Anything with a *name a player would say aloud* belongs in
> SIGNATURE-MOMENTS; the sound/light/haptic *choreography* belongs here.

Nintendo and Supercell design these deliberately. A magic moment is a small,
multi-sensory reward stacked so the whole is bigger than its parts — and it's the
thing players remember and re-tell.

## Anatomy of a magic moment

A great one layers **≥3 senses within ~1 second**, then resolves cleanly:
sight (motion/colour/light) + sound (a rising, pleasant tone) + touch (a crisp
haptic) + *meaning* (something changed for the better). Then it *gets out of the
way* — magic that overstays becomes friction.

## The catalog (design intent, then build to budget)

Each entry names the trigger and the choreography. Build within
[`PERFORMANCE.md`](./PERFORMANCE.md) and always ship a `prefers-reduced-motion`
path ([`ACCESSIBILITY.md`](./ACCESSIBILITY.md)) — the static version must still
feel good, not empty.

| Trigger | The magic (sight · sound · touch · meaning) |
|---|---|
| **Word solved** | tiles flip in sequence · rising chime · light tick · row locks green |
| **5 bonus words in a level** | coins burst and arc to the counter · brighter choir swell · double haptic · backdrop sun warms, chapter title glows |
| **Streak ticks** | flame grows one notch with a spark · warm low tone · single tap · "Day N" stamps in |
| **Streak *saved* by a shield** | shield flares and absorbs · soft protective chord · gentle buzz · relief, not loss |
| **Last-guess clutch solve** | slow-mo final flip · held breath → release sting · sharp tap · "Clutch!" |
| **Chapter completed** | map path lights to the next landmark · SA-motif fanfare · celebratory pattern · the map *opens* |
| **Signature moment** | the specific card animates in ([`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md)) · signature sting · strong haptic · a share is offered |

## Design rules (so magic stays magic)

1. **Rarer = bigger.** Reserve the largest choreography for genuine milestones; a
   full celebration every tap is wallpaper (same tiering logic as signature moments).
2. **Never fake it.** No engineered near-miss, no confetti for a loss dressed as a
   win (Principle 2). Magic celebrates *real* progress only.
3. **Local flavour.** Sounds and motifs lean South African (landmark glows,
   provincial colours, choir textures) — the un-copyable warmth
   ([`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md)).
4. **Budget-bound.** `transform`/`opacity`, canvas particles (`fx.ts`), synth
   audio (`sound.ts`) — juice is not an excuse to break the KB/FPS budget.
5. **Reduced-motion parity.** Every magic moment has a calm path that still lands
   the *meaning*.

## How to add one

Propose it in an [RFC](./RFC/) (name the emotion, the choreography, the KB cost,
the reduced-motion path). When it ships, if it's tied to a named milestone, register
it in [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md) too.
