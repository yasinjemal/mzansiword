# PRINCIPLES.md — The MzansiWord Constitution

**Version 1.0 · 2026-07-06 · Status: binding**

This is the constitution of MzansiWord. Every other document, every feature, and
every AI agent (see [`AGENTS-OS.md`](./AGENTS-OS.md)) is subordinate to it. The
[Game Design Bible](./GAME-DESIGN-BIBLE.md) argues *why* these principles are
right; this file states them as law and is deliberately short so it can be read
before every decision.

When a principle here conflicts with a feature idea, a deadline, or a revenue
opportunity, **the principle wins and the idea is redesigned.** If two principles
conflict, the lower-numbered one wins. Amending this file requires an entry in
[`DECISION-LOG.md`](./DECISION-LOG.md) explaining what changed and why.

---

## The Prime Directive

> **Sell time, depth, convenience, identity, and access — never power, never
> advantage, never entry.**

MzansiWord gives away real airtime and data. It is legal only as a **promotional
competition under Consumer Protection Act section 36** — not as gambling. The
instant a player can pay for anything that improves their chance of winning, the
draw becomes an illegal lottery. This is not a limitation to work around; it is
our single most valuable strategic asset and our ethics guarantee. See
[Bible §1](./GAME-DESIGN-BIBLE.md#1-the-one-constraint-that-governs-everything).

Everything below serves the Prime Directive.

---

## The Twelve Principles

**1. Legality is a launch gate, not paperwork.** No coin, ticket, hint, entry,
or advantage may ever be purchasable. Entry to any prize event is free and
skill-based by default. The coins-for-tickets question and the CPA rules pass a
South African attorney *before* the relevant feature ships, not after. See
[`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md), [`ECONOMY.md`](./ECONOMY.md).

**2. Player trust outranks short-term revenue.** We refuse dark patterns that
demonstrably work — guilt/shame notifications, engineered near-misses, fake
urgency, paywalling the only streak-save, removing stopping points. An
educational game giving real prizes to a mass market holds a higher ethical bar,
and holding it is also our best brand strategy with schools, sponsors, and
government.

**3. The first minute is sacred (the 60-second rule).** A new player opening a
forwarded WhatsApp link must reach a win and an "aha" in under 60 seconds — no
signup, no tutorial wall, no download, no gate. Depth is layered *behind* the
first minute, never in front of it. Any feature that slows, clutters, or gates
the opening win loses.

**4. Performance beats visual excess.** Target 60 FPS on the cheapest Android
that ships. Budget ≤ ~10 KB gzipped per feature; animate `transform`/`opacity`
only; synthesize audio, ship no heavy engines. Every kilobyte saved at SA data
prices is a player retained. Measure on a real low-end device; never guess. See
[`PERFORMANCE.md`](./PERFORMANCE.md), [`../GAME-FEEL.md`](../GAME-FEEL.md).

**5. The daily streak is the spine.** One player, one identity, one streak,
advanced by any qualifying daily action across *both* game modes. Loss aversion
is the strongest retention force we have; everything hangs off the streak. See
[`RETENTION.md`](./RETENTION.md).

**6. Name the emotion before you build.** Every feature must state, in one
sentence, the feeling it creates ("I discovered a word," "I represented my
province," "I beat my school," "I won data"). A feature that cannot name its
emotion does not ship. See [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md).

**7. Learning must never feel like homework, and never be paywalled.** The
learning core is always free. Revenue comes from teacher/admin tooling (B2B) and
family cosmetics (B2C) — paying never buys a grade or an advantage. Mastery is
measured rigorously enough to stand behind a funding claim. See
[`EDUCATION.md`](./EDUCATION.md).

**8. Server authority where money lives; client authority where it doesn't.**
Prize game, draws, wallets, and tournament scoring are server-authoritative and
auditable. Journey is client-authoritative by design — no prize, so instant
offline feedback wins. Do not "fix" Journey with pointless server validation.
See [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`ANTI-CHEAT.md`](./ANTI-CHEAT.md).

**9. Content depth is on the critical path.** A word game with thin content in
its flagship differentiating language (isiXhosa) has a broken core, not a missing
feature. Native-speaker review and wordlist expansion are resourced now, not
"later." No feature outranks this. See [`WORD-SYSTEM.md`](./WORD-SYSTEM.md).

**10. Build depth before breadth; sequence off async score-attack.** Resist
feature sprawl — a small team across shallow features and a small audience across
empty queues both fail. Async score-attack is the keystone that *becomes*
leagues, clubs, school-vs-school, and tournaments. Build one thing well and reuse
it. See [`COMPETITIVE.md`](./COMPETITIVE.md), [`ROADMAP.md`](./ROADMAP.md).

**11. WhatsApp-native, offline-tolerant, share-first.** Growth in South Africa is
a WhatsApp phenomenon; the first touch is a forwarded link. Every social surface
is designed for that link. The spoiler-free share card is the product's most
important pixel. See [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md).

**12. Accessibility and child safety are requirements, not enhancements.**
`prefers-reduced-motion` respected, colour-blind-safe states, one-thumb reach,
plain localized language. Provable guardian consent for under-18s and minor-safe
defaults are built into the schema and onboarding from day one, never retrofitted.
See [`ACCESSIBILITY.md`](./ACCESSIBILITY.md), [`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md).

---

## Quality gates (every feature must pass all of them)

A feature ships only if the answer to **all** of these is yes:

1. Is it legal under the Prime Directive (no purchasable advantage/entry)?
2. Does it preserve the 60-second first win?
3. Can it name the emotion it creates?
4. Does it improve retention, learning, or ethical revenue — or it doesn't ship?
5. Is it understandable in ≤ 5 seconds by a mass-market player in plain language?
6. Does it hold the performance budget on low-end Android?
7. Is it server-authoritative wherever it touches money?
8. Does it respect accessibility and (where minors are in scope) POPIA?
9. Is it shareable, or at least share-neutral, on WhatsApp?
10. Would Nintendo, Apple, and Duolingo's retention team each approve it?

If any answer is no: **reject and redesign.** Record notable rejections in
[`DECISION-LOG.md`](./DECISION-LOG.md) so the reasoning compounds.

---

## The five things that matter most (if you do nothing else)

From [Bible §20](./GAME-DESIGN-BIBLE.md#20-the-one-paragraph-thesis):

1. **Build the streak** (unified, cross-mode) — [`RETENTION.md`](./RETENTION.md).
2. **Ship the share card** (spoiler-free, WhatsApp-ready) — [`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md).
3. **Land the telco** (zero-rating + prize funding) — [`SPONSORS.md`](./SPONSORS.md).
4. **Deepen the isiXhosa content** — [`WORD-SYSTEM.md`](./WORD-SYSTEM.md).
5. **Sequence everything else off async score-attack** — [`COMPETITIVE.md`](./COMPETITIVE.md).

Do these five well and the platform builds itself.
