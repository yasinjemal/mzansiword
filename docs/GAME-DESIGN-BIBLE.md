# MzansiWord — Game Design Bible

**Version 1.0 · July 2026 · Status: strategic reference, not a spec**

> An executive-level design and business bible for MzansiWord — a South African
> word-puzzle PWA with the ambition to become the leading educational word-game
> platform in Africa. Written for investors, developers, designers, educators,
> sponsors, and government partners.
>
> This document is deliberately **critical, not just creative**. Where an idea in
> the founding brief is weak, it says so and proposes a better alternative.
> Every recommendation is filtered through three tests: does it improve
> **long-term retention**, does it **scale**, and is it **financially and legally
> sustainable**? Novelty on its own is rejected.

---

## How to read this document

- **§1–3** are the strategic foundation: the one constraint that governs everything, the market reality, and the principles distilled from the best games in the world. Read these even if you read nothing else.
- **§4–13** are the system designs: gameplay, retention, social, competitive, tournaments, sponsors, education, economy, monetization.
- **§14–16** are execution: monetization, technical architecture, and anti-cheat/safety.
- **§17** is the roadmap (12-month / 24-month / 5-year).
- **§18** is the part most design docs omit: **where this plan is most likely to fail, and what we are deliberately choosing *not* to build.**

A companion research brief with full citations sits behind every claim; sources are listed in §18.

---

## 1. The one constraint that governs everything

MzansiWord gives away real airtime and data. It can only do this legally because it runs as a **promotional competition under section 36 of the Consumer Protection Act (CPA)** — *not* as gambling under the National Gambling Act. The switch between the two is a single word: **consideration.**

The moment a player must pay for *anything* that improves their chance of winning — coins, hints, extra lives, tournament entry, a better puzzle — the prize draw becomes an illegal lottery. Under SA law, electronic entry may cost no more than **R1.50** (transmission only), the right to a prize vests on entry and cannot be made contingent on payment, the rules must be lodged and available free, and draws must be **independently verified**. The codebase already respects this: `docs/journey.md` explicitly forbids a purchase path for coins or hints, and the daily draw is auditable (`npm run verify-draw`). That instinct is correct and must never be relaxed.

**This is not a limitation to work around. It is the single most valuable strategic asset in the whole design.** Almost every competitor's economy — Candy Crush (~95% IAP, whale-driven), Clash Royale (paid power that triggered a global boycott) — is *structurally illegal* for a prize-linked game in South Africa. Being forbidden from selling power forces MzansiWord into the *only* monetization models that survive for a decade: convenience, cosmetics, subscriptions that sell depth, advertising, and B2B licensing. It is a legal moat and an ethics guarantee at the same time.

**The governing rule for this entire document:**

> **Sell time, depth, convenience, identity, and access — never power, never advantage, never entry.**

Everything below obeys it. Where a tempting mechanic violates it, it is cut and a compliant alternative is proposed.

A related legal duty: because the schools and learners angle puts under-18s in scope, **POPIA** requires provable parent/guardian consent for minors, and the burden of proof is on us. This must be designed into onboarding from day one, not bolted on (see §14).

---

## 2. Market reality — why this can work in South Africa

Design ambition means nothing without a market. South Africa's is unusually well-suited to *this specific game*, and unusually hostile to a heavier one.

**The audience is large, young, mobile, and reachable.**
- Internet penetration is **78.9% (≈50.8M people)**, and **99.3% of internet users own a smartphone** — the device is not the barrier. (Ignore the "39% smartphone penetration" stat sometimes quoted; it divides by the whole population including infants and is misleading for our audience.)
- Android is **83–85%** of the market; iOS is a rounding error in the mass market. Across Africa the **$100–199 entry tier is ~42% of shipments**. **Build for the cheapest Android that ships, and iOS comes free.**
- **WhatsApp reaches ~96% of online South Africans** and is the single favourite app for ~34% of them. This is the growth channel. The first touch is almost always a *forwarded link*, not an app-store listing — which is exactly why a PWA, not a native app, is the right primary vessel.

**The barrier is data cost, not devices.**
- Cheapest 1GB bundles run ~R85–89/month; small bundles are punitively priced per-MB, which is why "Data Must Fall" is politically live. **A tiny, cache-first, offline-tolerant payload is the difference between playable and abandoned.** The existing PWA discipline (GAME-FEEL.md's ≤10 KB-per-feature budget, no heavy engines) is not fussiness — it is the core growth strategy.
- **Zero-rating is real and available** (MTN and Vodacom already zero-rate education/government sites). A telco zero-rating deal that makes MzansiWord free to play on-network is the highest-leverage partnership in this entire plan (see §11).

**There is a national problem this game is uniquely positioned to address.**
- **PIRLS 2021: 81% of Grade 4 learners cannot read for meaning in any language** — SA ranked last of 43 countries. There are ~15.4M learners and ~451k teachers. Government, schools, and CSR funders are actively looking for literacy interventions.
- **12 official languages**; English is the home language of only ~7% but becomes the language of instruction for ~99% of learners from Grade 4. The **2024 BELA Act** actively pushes multilingual and African-language education. An isiXhosa + English word game is culturally *and* politically on-trend; isiZulu (24.4%, the largest home language) is the obvious next expansion.

**The money is where we're pointed.**
- SA mobile gaming: ~**US$134M and 18M+ users in 2025**. Africa's games market: **~US$1.8bn in 2024, growing 12.4% YoY (≈6× the global rate)**, mobile ≈90% of revenue. Telcos (Vodacom 50.7M, MTN 39.2M subs) and mass-market retailers (Shoprite Xtra Savings has **33.7M members**) already run airtime/data loyalty programmes — and research shows **mass-market consumers prefer airtime/data as rewards over anything else.** MzansiWord's reward currency is already what the market wants and what sponsors already pay in.

**Verdict:** the market fit is real and specific. It rewards exactly the constraints the game already imposes on itself (lightweight, WhatsApp-native, localized, prize-in-airtime) and punishes the heavyweight, whale-monetized model of global hits. Play to the constraint.

---

## 3. What the best games actually teach us (principles, not features)

The founding brief lists a dozen games to study. Copying their *features* would be a mistake — most of those features exist to monetize power, which we cannot do. The transferable value is in the **psychological principles**. Here are the ones that matter, each with the evidence and the MzansiWord translation.

**3.1 Loss aversion is the strongest retention force there is.** People work about twice as hard to avoid losing something they have than to gain something new. Duolingo's streak is described by its own retention team as "the biggest growth driver for the company"; **9–10 million users hold 365+ day streaks**, and users are "**7× more likely to finish** a course with a 30-day streak." → *The daily streak is MzansiWord's retention spine. Everything else hangs off it.*

**3.2 The first seven days decide the next five years.** Duolingo found retention "locks in" at a 7-day streak, and runs most of its experiments on the 0→7 window. Giving new users **2 streak freezes** to survive early misses was a top win; a **free, effort-based streak repair** ("earn it back" by solving extra puzzles) beat selling repairs. → *Obsess over onboarding and week one. Forgiving early, meaningful late.*

**3.3 Scarcity creates appointments.** Wordle's one-puzzle-a-day is the *point*, not a limitation — it makes each play precious, prevents burnout, and made the spoiler-free emoji grid share the most viral mechanic of the decade. It grew from 90 to 300,000 players in two months on that alone. → *One shared "Word of the Day" everyone plays simultaneously, with a spoiler-free, WhatsApp-optimized share card. Practice modes live separately so scarcity stays on the marquee.*

**3.4 Variable rewards drive anticipation — but the ethical line is bright.** Unpredictable reward timing is the most powerful reinforcement schedule, and dopamine peaks in *anticipation*. Near-misses recruit the same pathways as wins ("you were one letter away!"). → *Vary bonus discoveries and celebratory intensity; frame genuine near-misses honestly. **Never** engineer fake near-misses or loss-disguised-as-win — that is the gambling dark pattern, and it is doubly forbidden in an educational, prize-linked product.*

**3.5 Respect the stopping point.** A healthy free-to-play session is **~3–5 minutes** with a clean, satisfying end that still plants the next hook. Flow (absorbed, healthy) beats compulsion (anxious, chasing) for *long-term* retention. → *The daily core loop completes in 3–5 minutes: solve, streak ticks, share, "come back tomorrow." Never punish stopping.*

**3.6 Comprehension is retention.** Duolingo lifted DAU by **10,000+** with an 8-word explanation of how streaks work. Players don't value what they don't understand. → *Teach by playing, in plain localized language. A confused player is a churned player.*

**3.7 Weekly leagues weaponize loss aversion socially.** Duolingo's promotion/relegation leagues (cohorts of ~30, top 7 up / bottom 5 down each week) lifted lesson completion **+25%**; active leaderboard users do **40% more**. Fear of *relegation* re-engages more reliably than hope of promotion. → *A weekly league, cohorts anchored to SA timezone, with a visible relegation zone, is the second retention pillar after streaks.*

**3.8 Group identity manufactures return.** Clubs/clans with roles, chat, and shared team races (Brawl Stars Club League, Clash Royale River Race) make individual absence *visibly* let the team down. → *Clubs mapped to real SA identities — school, province, township, workplace — with team races where every member's daily play adds to a shared score.*

**Dark patterns we refuse to ship**, even though they demonstrably work: guilt/shame notifications (Duolingo's crying owl), artificial near-misses, paywalling the only streak-save, fake urgency, and removing stopping points to inflate session time. An educational game that gives real prizes to a vulnerable mass market has a higher ethical bar than a global casual title, and holding that bar is also good brand strategy with schools, sponsors, and government.

---

## 4. Core gameplay — a critical look at the two pillars

MzansiWord today has two distinct games sharing a shell:

1. **The Daily Prize Game** — a server-validated daily word puzzle; solvers enter a nightly random draw for airtime. This is the *appointment* and the *legal product*.
2. **Journey Mode** — a Words-of-Wonders / Wordscapes-style letter-wheel crossword with coins, hints, bonus words, and SA-landmark chapters. Client-authoritative, no prizes attached. This is the *depth* and the *daily habit filler*.

**This dual structure is genuinely smart and should be kept.** It mirrors NYT's model (a free shared daily puzzle as the funnel; a deep archive/second game as the retention engine) while keeping the prize game legally clean and the depth mode offline-friendly. The daily game creates the *reason to come back at a specific time*; Journey creates the *reason to stay for five minutes*.

**But there is a strategic weakness to confront now:** the two pillars currently share almost no progression. A player can have a 40-day daily streak and a 3-chapter Journey and feel like they're playing two apps. **The single most important gameplay decision in the next six months is to unify them under one identity and one streak** (see §5, §7). The daily puzzle and a Journey level should both feed the *same* streak, the *same* profile, the *same* league XP. Two games, one player, one habit.

**Critical assessment of the current feature set** (from GAME-FEEL.md and journey.md):

- *Kept and correct:* the retention-first reprioritization (A retention → B feel → C delight), synthesized audio (zero files), canvas FX over PixiJS, `prefers-reduced-motion` respected, server-authoritative economy. This is disciplined, mature engineering. Do not undo it.
- *The Rive mascot is correctly parked.* Mascots don't move retention until players already love the game. Revisit only after the streak/league metrics are healthy. This is exactly the right call and it should be defended against the temptation to make the game "cuter" before it's sticky.
- *The biggest content risk is isiXhosa depth.* Journey currently generates only ~15 isiXhosa levels from a ~390-word draft list. **A word game with thin content in its flagship differentiating language is a serious problem**, not a footnote. Native-speaker wordlist expansion is not a "nice to have for later" — it is on the critical path and should be resourced now (see §13, §16). The English experience being deep while the isiXhosa one is shallow undercuts the entire "national/educational" positioning.

**The emotional-moment mandate.** The brief's core philosophy — every session must create at least one emotional moment — is right, and the game already does this well (Mzansi Moments, bonus celebrations, streak flame). The discipline to add: **name the intended emotion for every feature before building it.** "I almost got it," "I discovered a word," "I beat my school," "I won data," "I represented my province." A feature that can't name its emotion doesn't ship.

**The 60-second rule (a hard design gate, not a nicety).** The reason MzansiWord can spread through WhatsApp at all is that a stranger can open a forwarded link, understand the game in seconds, solve a few words, and *feel smart* — with no signup, no tutorial wall, no download. That first-minute experience is the entire top of the funnel, and it is fragile. **Every future feature — clubs, tournaments, sponsors, schools, leagues — must preserve it.** The rule: a new player reaching the game for the first time must reach a *win and an "aha" in under 60 seconds*, and no feature may push complexity, gating, or account-creation in front of that first win. Depth is layered *behind* the first minute, never in front of it. When a proposed feature would slow, clutter, or gate the opening experience, the feature loses. This is the counterweight to everything ambitious in this document: **the first minute stays effortless while the long-term depth keeps growing.** A game that becomes a platform but forgets how to be understood in ten seconds has lost the thing that made it spreadable.

---

## 5. Retention architecture

Retention is the whole game. Revenue, community, and social proof are all downstream of DAU that doesn't decay. Target the top quartile: **D1 ≥ 40%, D7 ≥ 20%, D30 ≥ 10%** (industry averages are roughly D1 26%, D7 8%, D30 <3%; puzzle is one of the stronger genres, so top-quartile is realistic, not fantasy).

**5.1 The unified daily streak (the spine).** One streak per player, advanced by *any* qualifying daily action (solving the daily puzzle **or** completing a Journey level). Rules, drawn straight from the evidence:
- **Grant 2 free streak shields to every new player** so early misses don't kill the habit before the 7-day lock-in.
- **Free, effort-based repair:** a missed day can be reclaimed by solving extra puzzles within a window — earned, not bought. (Buying is illegal here anyway, which conveniently forces the ethical design.)
- **Forgiving early, strict late:** generous shields in week one; long streaks are harder to auto-save so they stay meaningful.
- A no-reward **"Perfect Week" gold state** for pride. Pure accomplishment, no currency — this is the cheapest, stickiest reward there is.
- Surface the streak's value in plain language ("Keep your streak — 3 minutes"), never guilt.

**5.2 Weekly League (the social spine).** Duolingo-style promotion/relegation. Cohorts of ~30 players, ranked by weekly XP earned across *both* game modes, resetting Monday morning SA time. Top ~7 promote, bottom ~5 relegate, ~10 tiers Bronze→Diamond. The relegation zone must be *visible* — loss aversion is the engine. This is the highest-leverage new system to build after the unified streak, and it is cheap: it's a leaderboard with rules, not new gameplay.

**5.3 Session shaping.** The daily loop must complete in 3–5 minutes and end on a clean high: solve → streak ticks → share card offered → tomorrow teased. Journey provides optional overtime for engaged players. Never nag a player who stops.

**5.4 Notifications — intelligent, never manipulative.** Two per day maximum: a reminder timed to *this player's* historical play time (Duolingo found ~23.5h after last session is optimal), and an optional evening "streak at risk" nudge. Framed around the player's own goal and reward. **Zero guilt-shaming, zero fake urgency.** For a native wrap this needs push; until then, a lightweight WhatsApp opt-in reminder is a viable and very on-market channel.

**5.5 Missions.** Daily (3–5 min of purpose), weekly (a reason to return across the week), and seasonal (see §12). Player-*chosen* goals beat forced hard goals — even Duolingo found optionality won. Missions grant coins/XP/cosmetic-progress only, never advantage in the prize game.

---

## 6. Progression, mastery & player identity

Progression is what turns a game into *your* game. Because we can't sell power, identity and mastery carry disproportionate weight — which is a gift, because identity retains better than power anyway (Fortnite's cosmetic-only model is the proof).

**6.1 One profile, one identity.** Unify the two modes under a single player profile: display name, avatar, home province, optional school/club, streak, league tier, badges, titles, and a vocabulary/mastery record. This profile is the thing players customize, show off, and represent with.

**6.2 Mastery as a first-class, *educational* progression.** Beyond XP, track **words learned, categories mastered, and reading level**. For an educational product this is the differentiator no casual competitor can copy credibly: a player (or a parent, or a teacher) can *see literacy improving*. This record is also the raw material for the schools product (§12) and for the "measurable literacy intervention" pitch to funders and government.

**6.3 Player identity tied to real SA belonging.** Province, school, township, home language. This is the emotional core the brief keeps circling ("I represented my school / province / South Africa") and it is achievable cheaply: it's metadata on a profile that feeds leaderboards and club races. It also makes every share inherently local and meaningful.

**6.4 Collections & customization (the cosmetic economy).** SA-cultural themes (landmark tile skins, provincial colours, beadwork patterns, local art collaborations), avatars, frames, badges, titles. All earnable through play; some purchasable *because they confer zero gameplay advantage* and are therefore legal to sell (§13). This is where a large share of ethical revenue will come from over five years.

**6.5 Signature Moments — the stories players tell each other.** Retention (§5) explains why players keep coming back; Signature Moments explain why they fall in *love* and, crucially, why they *tell someone else*. Every game that became a phenomenon minted a small set of iconic, repeatable moments its players quote unprompted: Clash Royale's "I finally reached Arena 10," Pokémon GO's "I caught my first legendary," Duolingo's "365-day streak," Wordle's "solved it in 2." These aren't features — they are *engineered memories*, and MzansiWord needs its own, unmistakably South African.

The signature set (launch with a handful, grow the library over time):
- 🇿🇦 "You discovered your **1,000th South African word**." *(mastery pride — and the educational proof point.)*
- 🔥 "**100-day Ubuntu streak**." *(loss-aversion payoff, named in a way no global game can copy.)*
- 🏆 "**First player in Limpopo today**." *(provincial belonging + daily appointment, fused.)*
- 🎓 "**Completed the Grade 5 vocabulary collection**." *(the school/parent-facing achievement.)*
- 📖 "**Discovered every animal word**." *(collection completion — a clean, nameable goal.)*
- 🌍 "**Represented Eastern Cape in a national tournament**." *(the "I represented" moment the whole competitive layer exists to produce.)*
- 🎉 "**Your school reached #1 this week**." *(shared, social, and inherently viral.)*

What makes a Signature Moment (the design rules, so this stays a system and not a pile of popups):
1. **It has a name and an emotion** (§4's mandate) — a player can *say* it in one sentence.
2. **It is rare enough to matter** — tiered by difficulty; a moment that fires every session is wallpaper, not a memory. Reserve the biggest celebrations for genuine milestones.
3. **It is shareable by design** — every signature moment generates a spoiler-free, WhatsApp-ready card (§7.1). The moment and the share are the same event. This is how a personal high becomes someone else's first touch.
4. **It is unmistakably local** — provinces, schools, home languages, SA wildlife and landmarks, Ubuntu. The un-copyable moat is that these moments *belong to South Africa*.
5. **It's cheap to build** — most of these are milestone detection on data the game already tracks (streak length, words learned, collection completion, leaderboard position, province). This is a high-emotion, low-complexity system — exactly the kind to prioritize.

Ship a first set of ~6–8 signature moments alongside the unified profile and streak (§17, Q1), because they are the affection layer that makes the retention spine worth returning to. Grow the library continuously — new collections, new provincial firsts, new seasonal moments — as the cheapest, highest-emotion content the game produces.

---

## 7. Social & viral systems

Growth in South Africa is a WhatsApp phenomenon. Design every social surface for the forwarded link.

**7.1 The share card is the product's most important pixel.** Wordle proved a spoiler-free, comparable result card can grow a game from 90 to millions with zero ad spend. MzansiWord's version: a clean, WhatsApp-optimized card showing your result *without spoiling the answer*, localized with SA flavour, one tap to share. Ship this before any paid acquisition — organic virality is both cheaper and more durable, and it's the only channel that scales to the mass market at SA data prices.

**7.2 Double-sided referral.** Both inviter and invitee get in-app currency/cosmetic rewards. Be realistic: sustained K-factor > 1 is rare; aim for **K ≈ 0.4–0.6** compounded by a *fast daily* share cycle. The referral reward must be free-to-deliver (coins, cosmetics, streak shields) so it can't be gamed for real value — which the legal constraint enforces anyway.

**7.3 Friend challenges & rivalries.** "Beat my score on today's puzzle" via a WhatsApp link is the most natural social loop in the whole design and should be near-launch. Weekly friend-vs-friend rivalries add a recurring reason to share.

**7.4 Clubs (the group-identity engine).** Clubs mapped to real identities (school, province, workplace, or freeform), with roles (like Brawl Stars' President/VP/Senior/Member), a club chat, and a **bi-weekly club race** where every member's daily play adds to a shared score. Individual absence visibly hurts your school/province — that's the retention mechanism. Clubs are also the substrate for the entire competitive and tournament layer (§8–9).

**7.5 What *not* to build yet.** A full social feed, friend-of-friend discovery, or public profiles-with-following are premature and carry moderation/POPIA cost far exceeding their early value. Ship share cards, referrals, friend challenges, and clubs first.

---

## 8. Competitive systems & multiplayer — what launches first

The brief lists fifteen multiplayer modes. **Building all fifteen would be a strategic error** — it would fragment a small player base across empty queues, and most modes need player density we won't have on day one. Sequence ruthlessly.

**8.1 Async-first is non-negotiable for SA connectivity.** Words With Friends built an empire on asynchronous turn-based play (up to 40 concurrent games, push when it's your turn). A dropped signal or a shared, data-metered phone must never break a match. **Real-time is an opt-in luxury mode, never the backbone.**

**8.2 The launch sequence (opinionated):**

1. **Async score-attack (launch).** Everyone plays the *same* puzzle; best score/time wins. This sidesteps matchmaking, latency, and pairing entirely, scales to unlimited players, and is trivially fair to score server-side. It is also the format that underpins tournaments (§9). *This is the first and most important competitive mode.*
2. **Friend challenges (launch).** Covered in §7.3 — the viral loop doubles as the casual competitive entry point.
3. **Weekly League (launch+1 month).** §5.2. The daily-return engine.
4. **Club races (launch+2–3 months).** §7.4. Team-vs-team via aggregated async play.
5. **Ranked ladder with ELO/MMR (month 4–6).** A persistent rating for players who want a competitive climb, used for fair matchmaking with a *widening* search window (Clash Royale widens ±1 every 5s) so nobody waits on a thin player base.
6. **Real-time blitz duels (month 6+, opt-in).** Small, fast, head-to-head — only once density supports live matchmaking.
7. **School-vs-school / province-vs-province (month 6–12).** Built on async score-attack + clubs, so it needs no new core tech — just aggregation, scheduling, and the tournament platform (§9).
8. **Spectator/replay for finals (year 2).** Turns big matches into shareable community events and sponsor surfaces; not worth it until there are finals worth watching.

Casual mode, private rooms, and daily/monthly/annual championships are *configurations of the above*, not separate builds — which is the point of sequencing this way.

**Why this order:** each step reuses the previous step's tech, every mode works at low player density, and nothing depends on real-time infrastructure until the audience justifies it. Async score-attack is the keystone: leagues, clubs, school-vs-school, and tournaments are all aggregations of it.

---

## 9. The tournament platform

The tournament platform is what turns a game into a *platform* — the thing schools, telcos, retailers, municipalities, and government can *use*. It is also where the largest B2B revenue lives (§11). It should be built as a first-class internal product, not a one-off event tool.

**9.1 Formats (borrowed from chess.com and Scrabble GO, both proven at scale):**
- **Async score-attack** (default): same puzzle set, best aggregate score in a window. Latency-free, scales to millions, perfect for province-wide or national events.
- **Swiss** for league days (e.g., school-vs-school): everyone plays every round, paired by score, no eliminations — nobody gets knocked out after one bad game, which matters for schools where participation is the point.
- **Single-elimination brackets** only for dramatic televised/streamed finals, never for mass rounds (they shed players fast).

**9.2 Scheduling & seeding.** Weekend tournaments, monthly championships, annual national final — a recurring calendar the community organizes its life around (appointment mechanics at the platform level). Seeding blends ELO + past tournament performance.

**9.3 Fairness is existential — treat word-solvers as an active threat.** Word games face a *specific, severe* cheating risk: screenshot-to-solver tools return every possible answer in milliseconds, and they are everywhere. Any event with real prizes *will* be attacked. The defense stack (detailed in §15):
- **Server-authoritative scoring**, always. The client never decides a result that touches a prize. (The daily game already does this correctly — extend it.)
- **Statistical anomaly detection** modeled on chess.com: flag inhuman solve times and impossible word-knowledge patterns; screen new accounts harder; ~85% automated with human review of edge cases.
- **Device fingerprinting** to kill multi-accounting and collusion in school/province events.
- **KYC only at prize redemption**, not signup — minimize friction, verify when money is at stake.
- A **documented, independently-verified fairness policy** (the CPA already requires independent verification of draws; extend the same rigor to tournaments). Sponsor trust depends on this being real and auditable.

**9.4 Prizes.** Airtime, data, food/shopping vouchers, tickets, phones, laptops, and — the highest-value, most PR-friendly tier — **scholarships and bursaries**. Prizes are funded by sponsors, never by player payments (§1). Prize denominations should match what the market actually wants (R5–R30 airtime/data for mass events; big-ticket items for finals).

**9.5 Moderation.** User-created tournaments and chat need auto-moderation across SA languages (English, Afrikaans, isiZulu, isiXhosa, etc.), player reporting, mute/shadowban, and human oversight during peak evening hours. This must exist *before* opening tournament creation to the public.

---

## 10. (folded into §9) — the tournament platform and sponsor platform share infrastructure; see §11.

---

## 11. The sponsor platform

This is the primary revenue engine and the reason the game becomes a national institution. The pitch to a sponsor is unusually strong: **MzansiWord reaches the exact mass-market, township, youth audience that MTN, Vodacom, Shoprite, Capitec, Coca-Cola, and FNB spend fortunes trying to reach — in a lightweight, brand-safe, educational, feel-good context, rewarding them in the airtime/data currency those brands already give away.**

**11.1 The two anchor sponsor relationships:**
- **A telco (Vodacom, MTN, or — likely more motivated — Telkom) for zero-rating + prize underwriting.** Zero-rating makes the game free to play on-network (removing the data barrier that is SA's real adoption ceiling) *and* gives the telco a gamified loyalty surface they already build anyway (VodaBucks, MTN Win-Win). This one deal simultaneously solves distribution, prize funding, and the education-tier funding. **It is the single highest-leverage partnership in the plan and should be pursued first.**
- **A mass-market retailer/bank (Shoprite, Capitec, Coca-Cola) for branded tournaments and prize pools.** Shoprite's Xtra Savings alone has 33.7M members; these brands want township reach and pay in exactly our reward currency.

**11.2 Sponsor dashboard (a real product).** Self-serve creation of branded tournaments with: branding rules (skinned tournament, sponsored "double coins" moments, branded puzzle packs — *never* pay-to-win), prize configuration and fulfillment, and analytics/campaign reporting: reach, participation, completion, regional/age/school/province targeting, and ROI vs. spend. Gaming is underpriced attention (<5% of ad spend, most players open to ads); the reporting is what converts a marketing manager.

**11.3 Fulfillment & trust.** Prize fulfillment must be reliable and auditable (the daily draw's audit trail is the template). A sponsor whose promised laptop never arrives is a brand disaster for them *and* us. Independent verification of tournament outcomes is a feature we sell, not overhead.

**11.4 Branding rules (the hard line, restated).** Sponsors may fund prizes, art, zero-rating, and events. Sponsors may **never** sell gameplay advantage or buy a player a better chance of winning. This protects both the CPA compliance and the game's integrity. It is also, usefully, an easy story to tell a brand: "your logo is on the trophy, not on a cheat code."

---

## 12. The education platform

Education is the moral mission, the government/CSR funding case, and a durable B2B revenue line — *if* it's built on the right model. The wrong model (charging students, or gating learning behind a paywall) is both illegal-adjacent under the promotional-competition rules and ethically indefensible for a literacy product.

**12.1 The correct model (Prodigy/Siyavula/Eneza pattern):** the **learning core is always free**; revenue comes from **teacher/admin tooling (B2B)** and **family-facing cosmetics (B2C)** — paying never buys a grade or an advantage. Siyavula reaches ~100% of SA government schools funded by CSR/grants (Google.org gave $1.5M); Eneza reaches 10M+ learners via telco partnership. This is the proven African path, and it aligns perfectly with our legal constraint.

**12.2 What schools get (free core):**
- Curriculum-aligned vocabulary and reading content in home languages, framed against the CAPS curriculum and the reading-for-meaning crisis.
- Teacher dashboard: class rankings, assignment setting, per-learner mastery/reading-level analytics, certificates.
- School and class leaderboards; inter-school competitions (built on the tournament platform, §9).
- Learner identity that lets a child "represent their school" — the emotional hook that makes adoption spread learner-to-learner.

**12.3 What generates revenue:**
- **Optional paid teacher/admin analytics tier** (per-school or per-district licence) — the depth-and-reporting product, à la Kahoot/Blooket. Never charges learners.
- **CSR/grant funding** for the free tier (the Siyavula model) — pitched to funders and government as a measurable literacy intervention, backed by the mastery/reading-level data the game already collects.
- **Telco-sponsored zero-rated education access** — the same telco relationship from §11.

**12.4 Why this is defensible.** A word game that can *measure* a learner's vocabulary and reading level improving over time, in their home language, on the cheapest phone, for free, at national scale — during a documented reading crisis — is a genuinely compelling proposition to the Department of Basic Education and to every education funder in the country. The measurement is the moat. Build the mastery tracking (§6.2) rigorously enough to stand behind a funding claim.

**Critical caution:** do not over-promise curriculum integration before the isiXhosa/African-language content is deep enough to deliver it. Thin content in an educational context isn't just a weak feature — it damages credibility with exactly the institutions we most need. Content depth (§13, §16) gates the education pitch.

---

## 13. The economy

Because coins **cannot be bought** (§1), MzansiWord's economy is far simpler and safer than a normal free-to-play economy — and this is another gift from the constraint. You cannot over-drain a currency players can't buy, so the classic inflationary death spiral is structurally impossible. But discipline still matters, because a flood of free coins makes rewards feel worthless.

**13.1 Currencies (keep them few):**
- **Coins** — soft currency, earned only. Spent on hints, cosmetics, and tournament tickets (see the legal note below). Faucets: puzzle completion, bonus words, daily gift, capped rewarded-ad watches. Sinks: hints, cosmetics, entry into *free* competitions.
- **Gems / premium currency** — earned through achievement, *or* granted with a subscription. **Never sold à la carte for gameplay advantage.** Used for cosmetics and convenience only.
- **Tournament tokens / raffle tickets** — earned by playing, spent to enter draws/tournaments. These are the flagship *sink* (below).

**13.2 Inflation control (faucets vs. sinks).** The iron rule: every faucet needs a sink. Because the faucet is capped (rewarded ads metered to a patient-player pace, not unlimited), the main tools are strong sinks and non-recirculating destruction:
- **The prize draw is the perfect sink:** earned coins/tickets spent to enter a draw are *destroyed* and converted into engagement toward real airtime prizes that never re-enter the coin supply. This is elegant — the retention mechanic *is* the economy's balancer.
- Seasonal resets, time-limited event tokens, and cosmetic sinks mop up hoards.
- If hoarding ever becomes a problem, a soft cap or gentle decay on idle coins works (the "wealth tax" pattern kept one MMO's money supply within 10% over two years). Unlikely to be needed early given capped faucets.

**13.3 The critical legal nuance on tickets.** Spending *earned* coins to enter a prize draw can, under a strict reading, count as "consideration" — which would re-trigger gambling law. **This must be reviewed by SA counsel.** The safe design, which the game already effectively uses: a genuinely **free entry path** (solving the daily puzzle enters you in the draw at no cost) and/or **skill-based winner determination** (a word game naturally fits the skill-contest framing, not pure luck). *Coins buying raffle tickets should not be shipped until a South African attorney confirms the structure. When in doubt, entry is always free and earned by skill.*

**13.4 Content as the deepest economy.** The wordlists are the real economy of a word game. **isiXhosa content depth is the top economic priority** — native-speaker review and expansion of the answer/guess lists, then regenerating Journey levels. This is under-resourced today (§4) and is on the critical path (§16). No amount of coin tuning matters if the flagship language runs out of levels.

---

## 14. Monetization — the ethical revenue model

Restated constraint: **sell time, depth, convenience, identity, and access — never power, advantage, or entry.** Within that, there are five durable revenue lines, deliberately ordered by fit-to-market.

**14.1 Rewarded video advertising (primary early revenue).** With no paid IAP, ads carry the mass market — this is how Wordscapes and every ad-forward word game monetize the ~96% who never pay. Design rules from the research:
- **Rewarded only** (opt-in, specific reward: "Watch for 50 coins" lifts opt-in 10–20 points). Minimize interstitials; no forced ads that break the 3–5 min loop.
- **Hybrid mediation across 5+ networks** (AdMob + Meta + Unity + ironSource/LevelPlay + AppLovin MAX) lifts eCPM 40–100% and fixes SA's patchy fill.
- **Plan conservatively:** SA rewarded eCPM ~$1–5, blended ARPDAU well below the ~$0.08 global casual average. Volume, not per-user value, is the model.
- **Meter the faucet:** rewarded-ad coins are capped so ads fund the business without wrecking the economy or the reward feeling.

**14.2 Subscription (primary long-term revenue).** A "MzansiWord Plus" that gates **depth and convenience, never power** — the chess.com/NYT playbook:
- No ads, unlimited practice / puzzle archive, post-game analysis and stats, extra streak shields (convenience, not advantage), exclusive cosmetics, offline packs.
- **Explicitly NOT gated:** the daily prize puzzle (must stay free and identical for all — both for fairness and for CPA compliance) and anything that improves win chance. A subscriber and a free player have exactly equal odds in every prize event. This is the line that keeps us legal and trusted.
- Price for SA reality — small monthly amount, annual discount, and family plans. Conversion will be low (chess.com ~1–1.5%, and SA card penetration is lower still); this is a long-tail line that grows with the audience.

**14.3 Cosmetics (the identity economy).** Directly sellable *because they confer zero advantage* (Fortnite's model). SA-cultural themes, avatars, frames, seasonal collections, local-artist collaborations. Over five years this becomes a major line as the audience and their attachment grow.

**14.4 Sponsor & branded content (the scale revenue).** §11. Branded tournaments, sponsored puzzle packs, telco zero-rating deals, prize-pool underwriting. This is the biggest revenue ceiling and the path to national-institution status.

**14.5 Education & B2B licensing (the durable revenue).** §12. Paid teacher/admin analytics tiers, district/provincial licences, CSR-funded free tiers, corporate team-building tournaments. Slow to start, very sticky once embedded.

**Revenue model summary:** ads fund the early mass-market business; sponsors and telco deals provide the large scale-up capital and prize funding; subscriptions and cosmetics monetize the engaged core ethically; education/B2B provides durable, mission-aligned recurring revenue. **No single line depends on selling power, so none of them threaten the legal foundation.** The diversification is itself a defense — a game that can't sell whales must build many honest revenue streams, and honest streams are more durable.

---

## 15. Technical architecture

The technical philosophy is already correct and should be *defended against feature pressure*, not rewritten. The constraints in GAME-FEEL.md are the strategy.

**15.1 Keep the PWA-first, lightweight architecture.** Next.js PWA + Supabase (Postgres, RLS, phone-OTP) + Vercel cron is a sound, cheap, scalable stack for this game. The growth loop is the instant-play WhatsApp link; a 30 MB native bundle would kill it. **No Unity, no Unreal, no three.js exports, no heavy engines** — the ≤10 KB-per-feature budget, `transform`/`opacity`-only animations, and synthesized audio are exactly right for entry-level Android on metered data. Every performance decision should be measured on a real low-end Android, as the doc already mandates.

**15.2 Server authority where money lives, client authority where it doesn't.** This existing split is excellent and should be the template for all new systems:
- **Prize game, draws, wallets, tournament scoring: server-authoritative.** The day's answer lives in a table with no RLS policy — client keys physically cannot read it; scoring happens in route handlers with the service-role key. Draws are seed-auditable and reproducible (`verify-draw`). Extend this exact rigor to every prize-linked tournament.
- **Journey: client-authoritative by design.** No prize attached, so cheating wins nothing; instant offline feedback matters more. The server is a clamped ledger only. This is the right trade and should not be "fixed" by adding pointless server validation.

**15.3 What to add, in order:**
- **Unified profile + streak service** (§5, §6) — the foundational new backend work.
- **League/leaderboard service** — cohort assignment, weekly reset, promotion/relegation. Mostly a scheduled job + queries.
- **Async tournament engine** — score aggregation over a puzzle set in a window; reuses daily-game scoring. The keystone for §8–9.
- **Anti-cheat/fingerprinting layer** — before any public prize tournament.
- **Capacitor native wrap (last)** — for a Play Store listing, native haptics, and push, with zero rewrite. Only after the PWA and the pilot checklist are done, exactly as GAME-FEEL.md sequences it.

**15.4 Offline & data-frugality as features.** Journey levels are already offline-playable once loaded; extend cache-first behavior everywhere non-prize. Every kilobyte saved is a player retained at SA data prices. Consider a genuinely offline "practice" pack that syncs progress when connectivity returns.

**15.5 POPIA/data architecture.** Phone numbers are personal information; under-18 learners require provable parent/guardian consent with the burden of proof on us. Build consent capture, data minimization, and retention policies into the schema and onboarding *now* — retrofitting compliance onto a live system with millions of minors' data is the kind of mistake that ends companies.

---

## 16. Anti-cheat, fairness, moderation & safety

Consolidated because these are one operational discipline, and because for a prize-linked, minor-inclusive game they are existential, not optional. (Mechanics detailed in §9.3 and §15.2.)

- **Anti-cheat:** server-authoritative scoring; statistical anomaly detection (chess.com model — inhuman solve times, impossible word knowledge, harder screening of new accounts); device fingerprinting against multi-accounting; sub-N-second solve auto-exclusion (already live in the daily game). ~85% automated, human review of edge cases.
- **Fairness & verification:** independent verification of draws (CPA requirement, already implemented) extended to tournaments; a published, third-party-vetted fairness policy that sponsors and schools can trust.
- **KYC at redemption only:** verify identity when a prize is claimed, not at signup — minimize friction, gate at the money.
- **Moderation:** auto-moderation across SA languages for chat, usernames, and any UGC; player reporting, mute, shadowban; human oversight at peak hours; ship before opening public tournament creation.
- **Child safety & POPIA:** provable guardian consent for under-18s, age-appropriate defaults, no open chat with strangers for minors, data minimization. Non-negotiable given the schools strategy.

---

## 17. Roadmaps

Prioritized by the three tests: retention impact, scalability, sustainability. Complexity (Low/Med/High), player impact (P), and business impact (B) noted. Dependencies flagged.

### 17.1 — 12-month roadmap (foundation & habit)

**Q1 — Unify and harden the habit**
- Unified profile + single cross-mode streak with 2 free shields and free effort-based repair. *(High complexity; P: critical, B: high — this is the retention spine.)*
- Spoiler-free WhatsApp share card + friend challenges. *(Low; P: high, B: high — organic growth loop.)*
- Complete the pilot-launch checklist: isiXhosa native-speaker review, legal pages, attorney pass on CPA rules, production puzzle scheduling. *(Med; gating dependency for public launch.)*
- Begin isiXhosa wordlist expansion — *starts now, runs continuously.* *(High; P: high, B: high; gates education & Journey depth.)*

**Q2 — Social retention**
- Weekly League (promotion/relegation). *(Med; P: high, B: med — second retention pillar.)* Depends on: unified profile/XP.
- Daily/weekly missions with player-chosen goals. *(Low–Med; P: med.)*
- Rewarded-ad integration with hybrid mediation. *(Med; P: low, B: high — first revenue.)*
- Intelligent, non-manipulative notifications (or WhatsApp reminders pre-native). *(Med; P: high.)*

**Q3 — Competition & first sponsor**
- Async score-attack competitive mode + ranked ELO/MMR. *(High; P: high, B: med.)* Keystone for tournaments.
- Clubs (school/province/workplace) + bi-weekly club races. *(High; P: high, B: med.)* Depends on: profile identity.
- First telco conversation → zero-rating + prize-underwriting pilot. *(High business effort; B: very high.)* The pivotal partnership.

**Q4 — Platform seed & native wrap**
- Tournament engine v1 (async score-attack + Swiss) with anti-cheat/fingerprinting. *(High; P: med, B: high.)* Depends on: async mode, anti-cheat.
- First branded/sponsored tournament (retailer or telco). *(Med; B: high.)*
- Capacitor native wrap for Play Store + push. *(Med; P: med, B: med.)*
- Cosmetic economy v1 (earnable + first sellable SA-cultural themes). *(Med; B: med.)*

### 17.2 — 24-month roadmap (platform & institution)

- **isiZulu launch** (largest home language; ~doubles home-language reach). *(High; P: high, B: high.)* Depends on: content pipeline maturity.
- **Education platform v1:** free school core, teacher dashboard, class/school leaderboards, mastery/reading-level analytics, certificates. *(High; B: high, mission-critical.)* Depends on: mastery tracking, content depth.
- **Sponsor dashboard** (self-serve branded tournaments + analytics/ROI reporting). *(High; B: very high.)*
- **School-vs-school and province-vs-province** competitions at scale. *(Med on top of tournament engine; P: very high emotionally.)*
- **Subscription (MzansiWord Plus)** — depth/convenience/cosmetics only. *(Med; B: med.)*
- **Season pass** (cosmetic + earned-coin, break-even loop, seasonal reset). *(Med; P: high, B: med.)*
- Real-time blitz duels (opt-in) once density supports it. *(Med; P: med.)*
- Monthly championships; annual national final planning. *(Med; P: high, B: high — PR/community.)*
- Full moderation stack for public/UGC tournaments. *(High; prerequisite for opening creation.)*

### 17.3 — 5-year roadmap (national institution → African platform)

- **National championship** with TV/radio partner and streamed spectator finals — the "represent South Africa" moment. *(B: very high brand.)*
- **CSR/government education partnership at national scale** (Siyavula model), positioned as a measured literacy intervention with published outcome data. *(B: high, mission-defining.)*
- **Language expansion across SA's official languages**, then **pan-African languages** (Swahili, Yoruba, Hausa, Amharic, French/Portuguese-Africa) — the content pipeline becomes the core competitive moat. *(High; B: very high.)*
- **Creator ecosystem — the shift from content *producer* to content *platform*.** This is the structural change that lets MzansiWord scale content faster than any small team could ever author it. Instead of the studio producing every puzzle, trusted institutions author their own: **teachers** create curriculum-aligned puzzle packs and set them as homework; **universities** publish vocabulary challenges; **municipalities** host local events; **tourism boards** create "Explore South Africa" puzzle journeys; **museums** create historical word packs; **wildlife organizations** create animal challenges tied to conservation. The studio's job becomes *tooling, moderation, and curation* — not manual content production. This is what finally makes the word "platform" (§9, §11, §12) literally true, and it compounds: every institution that authors content also brings its own audience. *(High complexity; P: med, B: high; a genuine moat.)* **Sequencing discipline:** gate this behind a mature moderation stack (§16) and real scale — user-generated content at national scale with minors present is a serious safety and POPIA surface, so it is deliberately a year-3+ capability, not an early one. Start with a tightly curated, invite-only pilot (a few vetted schools and one tourism/museum partner) before opening authorship broadly.
- **Regional expansion** into Nigeria, Kenya, Egypt (largest African markets) with local telco/sponsor partnerships replicating the SA playbook. *(Very high; B: very high.)*
- **Assessment/certification product** (Duolingo-English-Test analogue for African-language literacy) as a high-margin B2B/B2G line — *if* the mastery data proves credible. *(High; B: high.)*

---

## 18. Where this plan is most likely to fail (read this twice)

A design bible that only sells the upside is dishonest. Here are the real risks, ranked, and the honest mitigations.

**18.1 Thin African-language content undermines the entire positioning.** This is the #1 risk and it is present *today* (~15 isiXhosa levels). The "national/educational" story collapses if the flagship language runs out of puzzles. **Mitigation:** resource native-speaker wordlist expansion *now*, as critical-path work, not "later." No feature matters more.

**18.2 The prize-draw legal structure is one attorney's opinion away from existential trouble.** The CPA/gambling line is genuinely narrow, and the "coins-for-tickets = consideration" question is unresolved (§13.3). **Mitigation:** SA counsel review *before* shipping any coin→ticket path; keep a genuinely free, skill-based entry path as the default; treat the legal review as a launch gate, not paperwork.

**18.3 Monetization may not cover the cost of prizes + infrastructure at low SA ARPU.** Rewarded ads at ~$1–5 eCPM and ~1% subscription conversion is a thin per-user model. **Mitigation:** the business does *not* rely on player ARPU covering prizes — **sponsors and telcos fund the prizes**; player monetization funds operations. If the sponsor/telco relationships don't materialize, the prize element must shrink to what ads/subs can bear. The telco deal (§11.1) is therefore not "nice to have" — it is the load-bearing wall of the whole business. Pursue it first and hardest.

**18.4 Feature sprawl kills small teams.** The founding brief lists ~15 multiplayer modes, a dozen currencies-worth of economy items, and multiple platforms. **Building breadth before depth would spread a small audience across empty queues and a small team across shallow features.** Mitigation: the ruthless sequencing in §8 and §17 — async score-attack is the keystone that *becomes* leagues, clubs, school-vs-school, and tournaments, so you build one thing well and reuse it. Resist the urge to build all fifteen modes.

**18.5 Empty-room problem in competitive/social modes.** Leagues, clubs, and tournaments are miserable with no players. **Mitigation:** launch social features only when DAU density supports them (the §17 sequencing does this deliberately), and always fall back to async/score-attack formats that work with any number of players.

**18.6 Child-safety/POPIA failure at scale.** Millions of minors' data is a serious liability if consent and safety are retrofitted. **Mitigation:** build consent, data minimization, and minor-safe defaults into the schema and onboarding from day one (§15.5, §16).

**Things I'd cut or defer from the original brief:** the Rive mascot (correctly already parked); a full social feed / follower graph (moderation cost > early value); most of the fifteen named multiplayer modes as *separate builds* (they're configurations of async score-attack); coins-purchasable-anything (illegal here — and the constraint is a feature); annual/national championships in year one (no audience to fill them yet). None of these are bad ideas forever — they're bad ideas *first*.

---

## 20. The one-paragraph thesis

MzansiWord's genius is that its biggest constraint is its biggest moat. Because South African law forbids selling any gameplay advantage in a prize-linked game, MzansiWord is *structurally incapable* of the predatory, pay-to-win, whale-driven monetization that defines and eventually corrodes most of the games it studies — and is *forced* into the honest, durable models (habit, identity, advertising, sponsorship, education) that build institutions rather than extract from them. Layer that onto a market where the audience is huge and young, the device is a cheap Android, the channel is WhatsApp, the data is expensive (so lightweight wins), the reward people most want *is* airtime, sponsors already pay in airtime, and the nation has a literacy crisis it's desperate to solve — and you have the rare case where doing the ethical thing and doing the commercially smart thing are the same thing. Build the streak, ship the share card, land the telco, deepen the isiXhosa content, and sequence everything else off async score-attack. Do those five things well and the platform builds itself.

---

## 19. Sources

Retention & psychology: Lenny's Podcast / Jackson Shuttleworth on Duolingo streaks; JustAnotherPM; Deconstructor of Fun (Duolingo streaks & leagues); PocketGamer.biz (10M+ 365-day streaks); Wikipedia & NPR & TIME (Wordle); *Journal of Gambling Studies* (Candy Crush near-miss study, PMC5445157); Yu-kai Chou / Csikszentmihalyi flow; GameAnalytics 2025 Mobile Gaming Benchmarks; Nir Eyal (Hooked model); critiques of Duolingo guilt notifications.

Monetization & economy: Duolingo SEC filings (FY24/Q3-25); AppLovin (Wordscapes hybrid LTV); Sensor Tower; Business of Apps (Candy Crush); Deconstructor of Fun (battle passes, Clash Royale); Fortnite Wiki; Sherwood News & chess.com support (chess.com tiers); Wikipedia (NYT Games/Wordle); AdMob eCPM by country; rewarded-ad best practices; Prodigy/Kahoot/Blooket B2B models; Siyavula (OfferZen) & Eneza (UNESCO); game-economy inflation & gold-sink references; sweepstakes/skill-vs-chance legal framework (US, to be localized).

Social/competitive/tournaments: Wikipedia (Words With Friends); Duolingo leagues; Clash Royale matchmaking & clan wars; Brawl Stars clubs; chess.com Titled Tuesday, event rulebook, and fair-play/anti-cheat system; Swiss-system (Wikipedia); Scrabble GO tournaments; Dropbox referral case study & K-factor guides; device-fingerprinting/multi-accounting (Verisoul, SEON); gaming content-moderation guides; spectator-mode analyses.

South African market: DataReportal Digital 2025 South Africa; Statcounter (OS share); Counterpoint/GB Intl (device tiers); ITWeb, Daily Maverick, Competition Commission (data prices, "Data Must Fall"); Freedom House (zero-rating); Meltwater (WhatsApp usage, mobile gaming); Stats SA Census 2022 (languages); Al Jazeera & Africa Check (BELA Act); PIRLS 2021 via UP & Daily Maverick (reading crisis); Stats SA GHS 2023 & DBE (education system); TechCentral, Connecting Africa (telco subscribers); Shoprite Holdings & SA Loyalty Awards (retail loyalty); Cliffe Dekker Hofmeyr, GoLegal, NLC (CPA s36); the dtic (National Gambling Act); POPIA (child data); Statista/IMARC & PocketGamer.biz (market sizing).

*Full URLs are retained in the underlying research briefs. All legal points are directional and must be confirmed with South African counsel before launch; the promotional-competition/gambling distinction and the coins-for-entry question in particular are launch gates, not footnotes.*
