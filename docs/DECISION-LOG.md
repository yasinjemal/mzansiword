# DECISION-LOG.md

**Owner:** Product Strategist · Append-only. Newest first.

The record of *why* things are the way they are — especially rejections and
deferrals, so the reasoning compounds and isn't re-litigated. Every significant
"ship / redesign / cut" from the feature pipeline ([`AGENTS-OS.md`](./AGENTS-OS.md))
and every amendment to [`PRINCIPLES.md`](./PRINCIPLES.md) lands here.

**Format:** `YYYY-MM-DD — Decision — Rationale — Owner`

---

### 2026-07-09 — Adopt the network-effect filter + vocabulary-graph moat; reject a separate EXECUTION.md
From a founder strategy session. **Adopted (1): the network-effect design filter** —
alongside NORTH_STAR's four questions, ask of every feature: *"how does one player
create value for another player?"* The shared daily word is the network primitive
(same word for everyone is what makes shares, challenges, and leagues
commensurable — per-player difficulty would destroy it). **Adopted (2): the
long-term moat includes the vocabulary graph** — word-level aggregates from real
play (difficulty, common confusions, regional variants, synonym adjacency, per
language) become a dataset for African-language learning that nobody else has.
**Hard guardrails:** the graph is about *words, never children* — aggregates only,
POPIA minimization stands, no per-child profiling, and any external data product
needs counsel + a stewardship (not "we own African languages") posture. Costs
~nothing now: keep telemetry word-level and don't discard it; the graph's value
starts with dictionary depth (RISK R1), which was already the #1 priority.
**Adopted (3), growth deltas:** creator/streamer challenge links as a named
distribution channel (rides the shipped RFC-0004 tokens), family/private leagues
as a clubs flavor, scholarship tournaments as a sponsor format. **Rejected: a new
EXECUTION.md** — the vision/execution split already exists (NORTH_STAR = dream;
ROADMAP = order; PHASE-TRACKER = now; PROJECT_STATUS = dashboard) and a fifth
overlapping doc violates the anti-sprawl boundary set 2026-07-06. The daily
execution question — *"what is the smallest improvement that makes today's
players love the game more than yesterday?"* — lives in the tracker's Current
focus pointer, not a new file. — Product Strategist
On Technical-Director guidance, added the layer that turns *documentation* into
*decision-making*: [`NORTH_STAR.md`](./NORTH_STAR.md) (top-level intent),
[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) (living dashboard), [`ADR/`](./ADR/)
(0001–0004, permanent architecture records), [`RFC/`](./RFC/) (feature proposals
before code, with a mandatory ≥20% self-critique), [`TELEMETRY.md`](./TELEMETRY.md)
(event schema), [`MAGIC.md`](./MAGIC.md) (sensory juice), [`DESIGN_DEBT.md`](./DESIGN_DEBT.md),
and [`PLAYTESTS/`](./PLAYTESTS/). Added the **self-critique rule** to
[`../CLAUDE.md`](../CLAUDE.md) and the RFC step to the pipeline.
**The Bible is now frozen** — it changes rarely; change flows through the Decision
Log, Roadmap, Research, and ADRs instead. **Rationale:** documents *describe* the
project; ADRs/RFCs/telemetry/playtests/debt/north-star help us *decide* consistently
as it grows — the difference between hobby and studio.
**Boundaries set to prevent drift:** PROJECT_STATUS vs. PHASE-TRACKER (dashboard vs.
detail), TELEMETRY vs. ANALYTICS (schema vs. strategy), MAGIC vs. SIGNATURE-MOMENTS
(sensory juice vs. named milestones). — Product Strategist

### 2026-07-06 — Establish the doc system with the Bible as the single source of truth
Built the constitution ([`PRINCIPLES.md`](./PRINCIPLES.md)), the agent operating
system ([`AGENTS-OS.md`](./AGENTS-OS.md)), a refreshed evidence base
([`RESEARCH-2026.md`](./RESEARCH-2026.md)), and per-domain operational docs, all
anchored to [`GAME-DESIGN-BIBLE.md`](./GAME-DESIGN-BIBLE.md) rather than duplicating
it. **Rationale:** the Bible is already comprehensive and cross-referenced;
shattering it into 50 shallow, overlapping files would have *reduced* coherence and
violated the anti-sprawl discipline the Bible itself argues for (§18.4). Each domain
doc adds the operational layer (owner, status, KPIs, open questions) the Bible
doesn't carry, and links back to its section. — Product Strategist

### 2026-07-06 — Flag the 2027 PBO zero-rating obligation as a strategic lever
ICASA obliges SA networks to zero-rate qualifying public-benefit-organisation
content by 15 Jan 2027 ([`RESEARCH-2026.md`](./RESEARCH-2026.md) §7). **Open action:**
investigate with counsel whether the education tier qualifies — this could turn
zero-rating from a deal-to-strike into an entitlement-to-pursue. Tracked as
[`RISK-REGISTER.md`](./RISK-REGISTER.md) R9. — Sponsor Consultant

---

## Pre-existing decisions (carried from the Bible / GAME-FEEL / phase tracker)

These predate this log but are recorded so they aren't accidentally reopened:

- **Prime Directive: never sell power/advantage/entry.** The CPA s36 constraint is
  a moat, not a limitation (Bible §1). *Cannot be overruled.*
- **Dual-pillar structure kept** (daily prize game + Journey), to be unified under
  one identity and one streak — not merged into one game (Bible §4).
- **Server authority where money lives; client authority for Journey.** Do not add
  pointless server validation to the no-prize mode (Bible §15.2).
- **Rive mascot parked** — mascots don't move retention until players already love
  the game; revisit after streak/league metrics are healthy (Bible §4).
- **Full social feed / follower graph deferred** — moderation + POPIA cost exceeds
  early value (Bible §7.5).
- **Fifteen multiplayer modes → sequenced off async score-attack**, not built as
  separate products (Bible §8, §18.4).
- **Coins-for-tickets NOT shipped** pending SA counsel (Bible §13.3) — free,
  skill-based entry is the default.
- **Retention reprioritized A→B→C** (retention → feel → delight); synthesized
  audio, canvas FX, no heavy engines (GAME-FEEL.md).
- **Capacitor native wrap is last**, zero-rewrite, after the pilot checklist
  (GAME-FEEL.md Phase D, Bible §15.3).

*Amending PRINCIPLES.md requires a new entry here explaining what changed and why.*
