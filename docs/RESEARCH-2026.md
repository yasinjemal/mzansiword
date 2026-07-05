# RESEARCH-2026.md — Refreshed Evidence Base

**Compiled 2026-07-06 · Companion to [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md)**

The Bible's claims were validated against current (2025–2026) sources. This file
records what held, what moved, and one materially new fact. Every number below is
load-bearing for a design or business decision; cite this file, not memory.

---

## 1. South African market — confirmed, still favourable

- **Internet penetration 78.9% (≈50.8M people)** at the start of 2025, up 5.4% YoY.
  **124M cellular connections; ~97.5% are 3G/4G/5G broadband-enabled.** The device
  and the network are not the barrier. *(DataReportal Digital 2025 South Africa.)*
- **Data cost is the barrier.** ~US$1.18/GB average (2023), declining under
  competition and ICASA pressure but still punitive in small bundles — which is
  why the ≤10 KB-per-feature discipline ([`PERFORMANCE.md`](./PERFORMANCE.md)) is a
  growth strategy, not fussiness. *(Statista; ITWeb.)*
- **Android dominance** in the mass market persists; the entry-tier phone is the
  design target. Build for the cheapest Android and iOS comes free.

**Implication:** unchanged from Bible §2 — the market rewards exactly the
constraints the game imposes on itself and punishes heavyweight rivals.

## 2. WhatsApp is still the channel — arguably stronger

- **93.9%–96% of SA internet users are on WhatsApp**; it is the **single favourite
  app for ~34%** (ahead of TikTok 23.8%, Facebook 18.1%). Average **23h42m per
  month** per user — above the global average. Projected **~28M users by 2026.**
  *(Meltwater 2025; Statista; Ask Yazi.)*

**Implication:** Principle 11 holds hard. The forwarded link is the top of the
funnel; the share card is the most important pixel ([`SOCIAL-VIRAL.md`](./SOCIAL-VIRAL.md)).

## 3. Retention psychology — the evidence got bigger

- **Duolingo closed 2025 at 52.7M DAU and 12.2M paying subscribers**, with **~36%
  YoY DAU growth**. **Over half of daily learners now hold a 7+ day streak; ~9M
  hold year-plus streaks.** A **10-day streak** sharply reduces drop-off. Leagues
  (weekly promotion/relegation) and streaks remain the named growth drivers.
  *(Deconstructor of Fun 2025; Class Central 2025; Lenny's Newsletter.)*
- **2025 mobile retention benchmarks (GameAnalytics, 11,600 games):** average
  **D1 ~26–28%, top-quartile D7 ~7–8%, D28/D30 <3%.** **Puzzle is among the
  strongest genres for medium/long-term retention** — habitual play builds stable
  curves. *(GameAnalytics 2025 Mobile Gaming Benchmarks.)*

**Implication:** MzansiWord's targets in [`RETENTION.md`](./RETENTION.md)
(**D1 ≥ 40%, D7 ≥ 20%, D30 ≥ 10%**) are ambitious top-quartile-plus, but the
genre and the streak/league playbook make them realistic, not fantasy.

## 4. The reading crisis — unchanged, still the mission

- **PIRLS 2021: 81% of Grade 4 learners cannot read for meaning in any language**
  (914,000 of ~1.13M). South Africa ranked **last of 43 countries** and showed the
  **largest decline** of all participants (score 320→288 between 2016 and 2021).
  *(University of Pretoria; Daily Maverick; Nic Spaull.)*

**Implication:** the education case ([`EDUCATION.md`](./EDUCATION.md)) is as urgent
as ever. Measurement is the moat — build mastery tracking to funding-grade rigor.

## 5. Market size — the money is where we're pointed

- **Africa's games market ≈ US$2.29bn in 2025**, mobile ~60%, growing ~12.3%
  CAGR (roughly 1.6× the global rate). **South Africa mobile games ≈ US$134M
  (R2.4bn), 18M+ users**; SA has ~26.5M players (~44% penetration). *(PocketGamer.biz;
  Meltwater; Statista.)*
- Telcos and mass-market retailers already run airtime/data loyalty programmes,
  and mass-market consumers prefer airtime/data as rewards — **our reward currency
  is already what the market wants and what sponsors already pay in.**

## 6. The legal spine — CPA s36, restated precisely

- A **promotional competition** distributes prizes "by lot or chance" to promote a
  business and exceeds R1.00 in value. **Section 36(3)(a)** forbids requiring
  consideration beyond the cost of transmitting an entry; **Regulation 11(1) caps
  electronic entry transmission at R1.50**, inclusive of all subsequent
  communication. Consideration is *deemed received* if a participant must pay for
  access, for a device to participate, or must buy goods priced above the ordinary
  price. *(Cliffe Dekker Hofmeyr; GoLegal; Michalsons.)*

**Implication:** Principle 1 and [`SECURITY-LEGAL.md`](./SECURITY-LEGAL.md). The
coins-for-tickets path stays unshipped until SA counsel confirms it; free,
skill-based entry is the default.

## 7. **New and material: the 2027 zero-rating obligation**

- In **May 2024 ICASA published the process** by which **public-benefit
  organisations** can have their mobile content assessed for mandatory zero-rating.
  The mobile networks (Vodacom, MTN, rain, Telkom Mobile, Liquid) are **obliged to
  implement zero-rating of qualifying PBO content by 15 January 2027.** Vodacom
  already runs the CAPS-aligned, multilingual **e-School / Siyakha** zero-rated
  platform. *(ICASA via Ellipsis; UNESCO DTC toolkit; ITWeb.)*

**Why this matters:** the Bible treats a telco zero-rating deal as the
highest-leverage partnership (§11.1) but frames it as a *negotiation*. The 2027
PBO obligation opens a **second, regulatory path** to the same outcome: if
MzansiWord's education tier qualifies as public-benefit content, zero-rating may
become an *entitlement to pursue* rather than only a deal to strike. This should
be investigated by counsel and folded into both the education roadmap and the
telco conversation. Recorded as an open item in
[`DECISION-LOG.md`](./DECISION-LOG.md) and a watch item in
[`RISK-REGISTER.md`](./RISK-REGISTER.md).

---

## Sources

South African market & WhatsApp: [DataReportal Digital 2025 South Africa](https://datareportal.com/reports/digital-2025-south-africa); [Statista — SA 1GB data price](https://www.statista.com/statistics/1274035/price-for-mobile-data-in-south-africa/); [Meltwater — SA social media 2025](https://www.meltwater.com/en/blog/2025-social-media-statistics-south-africa); [Ask Yazi — WhatsApp across Africa 2025-26](https://www.askyazi.com/useful-data-sources-for-africa/whatsapp-usage-across-africa-key-statistics-insights-for-2025).

Retention & benchmarks: [Deconstructor of Fun — Duolingo 2025](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth); [Class Central — Duolingo in 2025](https://www.classcentral.com/report/duolingo-2025/); [Lenny's Newsletter — how Duolingo reignited growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth); [GameAnalytics 2025 Mobile Gaming Benchmarks](https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks).

Reading crisis: [University of Pretoria — PIRLS 2021](https://www.up.ac.za/research-matters/news/study-shows-81-of-grade-4-learners-sa-have-reading-difficulties); [Daily Maverick — 81% cannot read for meaning](https://www.dailymaverick.co.za/article/2023-05-16-international-study-shows-81-of-grade-4s-in-south-africa-cannot-read-for-meaning/); [Nic Spaull — 10 main findings](https://nicspaull.com/2023/05/18/10-main-findings-from-pirls-2021-south-africa/).

Market size: [PocketGamer.biz — Africa games $2.29bn 2025](https://www.pocketgamer.biz/mobile-leads-as-africas-games-industry-generated-229bn-in-2025/); [Meltwater — Mobile gaming in SA 2025](https://www.meltwater.com/en/blog/mobile-gaming-in-south-africa-2025).

Legal (CPA s36): [Cliffe Dekker Hofmeyr — promotional competitions](https://www.cliffedekkerhofmeyr.com/en/news/publications/2020/corporate/corporate-and-commercial-alert-22-january-Rules-of-the-game-Keep-the-consumer-protection-act-in-mind-when-facilitating-promotional-competitions.html); [GoLegal — we have a winner](https://www.golegal.co.za/winner-promotional-competition/); [Michalsons — promotional competitions and the law](https://www.michalsons.com/blog/promotional-competitions-law/10769).

Zero-rating: [Ellipsis — zero-rating of mobile content](https://www.ellipsis.co.za/zero-rating-of-mobile-content/); [UNESCO DTC — zero-rating factsheet](https://www.unesco.org/en/dtc-finance-toolkit-factsheets/zero-rating).
