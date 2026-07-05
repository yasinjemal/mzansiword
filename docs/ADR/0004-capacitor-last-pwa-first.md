# 0004 — PWA first, Capacitor native wrap last

- **Status:** Accepted
- **Date:** 2026-07-06 (documenting a sequencing decision)
- **Deciders:** Executive Game Director, Frontend Architect
- **Relates to:** [Bible §15.3](../GAME-DESIGN-BIBLE.md#15-technical-architecture); [`ROADMAP.md`](../ROADMAP.md); [`../GAME-FEEL.md`](../../GAME-FEEL.md)

## Context

South African growth is a WhatsApp phenomenon: the first touch is a *forwarded
link* to an instantly playable page ([`RESEARCH-2026.md`](../RESEARCH-2026.md)). A
30 MB native app-store download in front of that first touch would kill the funnel
and the 60-second rule ([`PRINCIPLES.md`](../PRINCIPLES.md) Principle 3). Yet a
Play Store listing, native haptics, and push notifications have real value later.

## Decision

**Ship as a PWA first; add a Capacitor native wrap last**, only after the PWA and
the pilot-launch checklist are complete. Capacitor wraps the existing app with
**zero rewrite**, adding store presence, native haptics, and push.

## Consequences

- **Easier now:** instant-play links, tiny payload, one codebase, fast iteration.
- **Easier later:** native capabilities without a second codebase or a port.
- **Harder:** until the wrap, no Play Store discovery and web-push limitations
  (mitigated pre-native by WhatsApp opt-in reminders, [`RETENTION.md`](../RETENTION.md)).
  Accepted — discovery matters far less than the frictionless first touch early on.

## Alternatives considered

- **Native-first (React Native / Flutter / Unity)** — rejected: kills the WhatsApp
  link funnel and multiplies build cost.
- **PWA forever, no wrap** — deferred, not rejected: acceptable, but the wrap is
  cheap upside (store trust, push) once the game is sticky.
