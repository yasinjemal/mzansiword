# ACCESSIBILITY.md

**Owner:** Accessibility Expert · **Canonical:** [Bible §16](./GAME-DESIGN-BIBLE.md#16-anti-cheat-fairness-moderation--safety) · Principle 12

**Accessibility is a requirement, not an enhancement.** For a mass-market
educational product used by millions across a wide range of devices, literacy
levels, and abilities, inclusion is core to the mission — and to reach.

## Requirements (every UI surface passes these)

- **`prefers-reduced-motion` respected** — a full, non-animated path to every
  celebration and transition (also a performance rule, [`PERFORMANCE.md`](./PERFORMANCE.md)).
- **Colour is never the only signal.** Wordle-style tile states (correct / present
  / absent) must be distinguishable without colour — use shape, pattern, or icon
  as well. Test with a colour-blind simulator.
- **Contrast** meets WCAG AA for text and interactive states.
- **One-thumb reach** — primary actions in the bottom two-thirds; the game is
  played one-handed on a phone, often on the move.
- **Touch targets ≥ 44px**; forgiving hit areas on the letter wheel and keyboard.
- **Plain, localized language** — comprehension is retention
  ([`PLAYER-PSYCHOLOGY.md`](./PLAYER-PSYCHOLOGY.md)); a confused player is a churned
  player. No jargon, no untranslated UI.
- **Screen-reader labels** on interactive controls; meaningful focus order.
- **No flashing** above safe thresholds (seizure safety).

## Inclusion beyond disability

- **Low literacy** — the first-minute experience must be winnable by someone still
  building reading skill (that is partly the point of the game). Icons + audio
  reinforce text.
- **Data/device constraints** — accessibility includes *affordability*: the
  lightweight, offline-tolerant build is an accessibility feature at SA data prices.
- **Language** — home-language content is an inclusion issue, not just a feature
  ([`EDUCATION.md`](./EDUCATION.md), [`WORD-SYSTEM.md`](./WORD-SYSTEM.md)).

## Process

Accessibility review is step 8 of the feature pipeline ([`AGENTS-OS.md`](./AGENTS-OS.md))
and the Accessibility Expert holds an approval gate on every UI surface. A feature
that fails an accessibility check is redesigned, not shipped with a "todo."

## KPIs

Reduced-motion parity (100% of animations have a static path), colour-blind pass
rate, WCAG AA contrast pass, screen-reader task completion.
