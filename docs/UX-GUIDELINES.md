# UX-GUIDELINES.md

**Owner:** UX Researcher · **Canonical:** [Bible §4](./GAME-DESIGN-BIBLE.md#4-core-gameplay--a-critical-look-at-the-two-pillars), [`journey.md`](./journey.md)

The UX north star is the **60-second rule** (Principle 3): a stranger opening a
forwarded WhatsApp link must reach a win and an "aha" in under 60 seconds — no
signup, tutorial wall, or download in front of it. This first minute is the entire
top of the funnel and it is fragile.

## The player journey (layer depth behind the first minute)

1. **First touch** — forwarded link → instant playable puzzle, no gate. Guest play
   works (`/api/profile/guest`).
2. **First win** — reachable in under 60 seconds; the "aha."
3. **First share** — the spoiler-free card is offered at the clean stopping point
   ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)).
4. **First return** — streak introduced in ≤ 8 words; the appointment forms.
5. **Habit** — the unified streak and league carry weeks 1→∞
   ([`RETENTION.md`](./RETENTION.md)).
6. **Identity** — province/school/club, mastery, cosmetics
   ([`PROGRESSION.md`](./PROGRESSION.md)).

Full sequence in [`journey.md`](./journey.md); regenerate with
`npm run generate-journey`.

## Standing UX rules

- **Account creation is never in front of the first win.** Ask for identity when
  the player has a reason to want it (a streak to protect, a prize to claim).
- **Every screen answers one question.** Reduce, don't add.
- **Plain, localized language** — comprehension is retention.
- **Respect the stopping point** — end clean, tease tomorrow, never nag.
- **Forgiving inputs** — generous hit areas, undo where cheap, no punishing dead-ends.

## The first-minute audit (run it every slice)

Each new feature is checked against: *does anything now gate, slow, or clutter the
opening win?* If yes, the feature loses. This is a standing item in
[`PHASE-TRACKER.md`](./PHASE-TRACKER.md).

## Research method

Test with **real low-end-device users** in the target market, not just the team.
Watch the first 60 seconds silently. Where a new player hesitates, the design — not
the player — is at fault.

## KPIs

Time-to-first-win, first-minute completion rate, guest→return rate, tutorial-free
comprehension, drop-off points in the first session.
