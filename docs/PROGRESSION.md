# PROGRESSION.md

**Owner:** Senior Game Designer + Learning Scientist · **Canonical:** [Bible §6](./GAME-DESIGN-BIBLE.md#6-progression-mastery--player-identity)

Progression turns a game into *your* game. Because we can't sell power
(Principle 1), identity and mastery carry disproportionate weight — which is a
gift, because identity retains better than power anyway (Fortnite proved it).

## The pillars

1. **One profile, one identity.** Unify both modes under a single profile: display
   name, avatar, home province, optional school/club, streak, league tier, badges,
   titles, vocabulary/mastery record. This is what players customize and represent
   with. Status: `profiles` table exists; cross-mode unification in progress.

2. **Mastery as first-class, *educational* progression.** Track **words learned,
   categories mastered, reading level** — not just XP. This is the differentiator
   no casual competitor can copy credibly: a player, parent, or teacher can *see
   literacy improving*. It is also the raw material for the schools product and the
   funding pitch ([`EDUCATION.md`](./EDUCATION.md)). Build it to funding-grade rigor.

3. **Identity tied to real SA belonging** — province, school, township, home
   language. Cheap (metadata on a profile feeding leaderboards and club races) and
   emotionally central ("I represented my school / province / South Africa"). Makes
   every share inherently local.

4. **Collections & cosmetics** — SA-cultural themes (landmark tile skins,
   provincial colours, beadwork patterns, local-artist collabs), avatars, frames,
   badges, titles. All earnable; some sellable *because they confer zero advantage*
   and are therefore legal ([`MONETIZATION.md`](./MONETIZATION.md), [`ECONOMY.md`](./ECONOMY.md)).

5. **Signature Moments** — the affection layer on top of progression. See
   [`SIGNATURE-MOMENTS.md`](./SIGNATURE-MOMENTS.md).

## Design rules

- Progression must never confer prize-game advantage (Principle 1) — league tier,
  badges, and mastery are identity and pride, not power.
- Mastery framing stays plain and localized; a parent should understand "reading
  level" without a glossary.

## KPIs

Profile completion rate, cosmetic earn/equip rate, mastery-record growth, D30 for
players with vs. without a chosen province/school.
