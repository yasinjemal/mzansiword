# Architecture Decision Records (ADR)

An ADR captures **one significant, hard-to-reverse decision** and the reasoning
behind it, so that years later we know *why* — not just *what*. ADRs are
**immutable once Accepted**: to change a decision, write a new ADR that supersedes
the old one (and update the old one's Status to "Superseded by NNNN").

**ADR vs. the other governance docs:**
- **ADR** = a *structural/technical* decision, permanent record (this folder).
- [`RFC/`](../RFC/) = a *proposal* for a feature, before it's built (may be rejected).
- [`DECISION-LOG.md`](../DECISION-LOG.md) = the running, lightweight log of all
  ship/redesign/cut calls; big architectural ones graduate into a full ADR here.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-word-engine-server-authority.md) | Word engine & server-authority split | Accepted |
| [0002](./0002-rive-mascot-parked.md) | Rive mascot parked until retention is proven | Accepted |
| [0003](./0003-canvas-fx-no-heavy-engine.md) | Canvas FX + synth audio, no heavy engine | Accepted |
| [0004](./0004-capacitor-last-pwa-first.md) | PWA first, Capacitor native wrap last | Accepted |

## Template

```markdown
# NNNN — <short title>

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** <roles>
- **Relates to:** <PRINCIPLES / Bible § / other ADRs>

## Context
What forces are at play — technical, legal, market, performance? What makes this
decision necessary and non-trivial?

## Decision
The choice we made, stated plainly.

## Consequences
What becomes easier and what becomes harder. Include the costs we accept.

## Alternatives considered
Option A / B / C and why they lost.
```
