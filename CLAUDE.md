@AGENTS.md

# Working on MzansiWord

Read [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) (the constitution) and
[`docs/NORTH_STAR.md`](./docs/NORTH_STAR.md) before proposing features. The full
documentation system is mapped in [`docs/README.md`](./docs/README.md);
[`docs/GAME-DESIGN-BIBLE.md`](./docs/GAME-DESIGN-BIBLE.md) is the canonical design
reference and is **frozen** (change it rarely — grow the Decision Log, Roadmap,
Research, and ADRs instead).

## The self-critique rule (mandatory)

**Before implementing or recommending any feature, spend at least 20% of your
response arguing against your own proposal.** Identify weaknesses, hidden costs,
maintenance burden, performance implications, accessibility issues, legal/POPIA
exposure, and honest reasons *not* to build it. Do not be a yes-man; the studio
culture is "never agree with weak ideas — critique everything, including your own."
Non-trivial features get a written [RFC](./docs/RFC/) whose "Case against" section
carries this weight.

## Standing rules (from PRINCIPLES.md — non-negotiable)

- **No paid advantage, ever** — no purchase path for coins/hints/entry/power (CPA s36).
- **60-second rule** — never gate the first-minute win.
- **Perf budget** — ≤ ~10 KB gz per feature; `transform`/`opacity` only; respect
  `prefers-reduced-motion`.
- **POPIA** — provable guardian consent for under-18s; data minimization.
- **Verify by playing** — real low-end Android where possible, else headless at 414×896.
- **Honesty** — 🟡 (partial) beats an optimistic ✅. Update
  [`docs/PHASE-TRACKER.md`](./docs/PHASE-TRACKER.md) and
  [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) in the same commit as the work.
