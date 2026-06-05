# Capability Model — Where the Prototype Factory Fits

Code Velocity Labs' engineering capability model divides work across three zones. Both the production factory and the prototype factory occupy the same zone — **Orchestration** — but with deliberately different operating disciplines. This document situates them side-by-side and documents the bridge between them.

---

## The three zones

| Zone | Owner | What happens here |
|------|-------|---------------------|
| **Intent** | Humans + long-lived AI Crew assistants | Idea-shaping, requirement-gathering, framing decisions. The hard part of knowing *what to build*. |
| **Orchestration** | Factories (this and its production sibling) | Translation work. Brief in, code out, with discipline appropriate to the situation. |
| **Validation** | Humans + AI quality checks | E2E tests, regression sweeps, human acceptance, business sign-off. The hard part of knowing *whether it's right*. |

**The principle: agents do translation work, humans do judgment work.**

Both factories are translation tools. Neither shapes ideas; neither validates outcomes. They take in shaped intent and produce candidate code.

---

## Where each factory sits

Both occupy the Orchestration zone. They sit side-by-side, **siblings, not parent-child**.

```
   ┌─────────────────────────────────────────────────────────────┐
   │ INTENT ZONE                                                 │
   │   ┌─────────────────────┐    ┌─────────────────────────┐   │
   │   │ /shape-brief        │    │ /spark                  │   │
   │   │ (production factory │    │ (prototype factory      │   │
   │   │  Intent-zone tool)  │    │  Intent-zone tool)      │   │
   │   └──────────┬──────────┘    └────────────┬────────────┘   │
   └──────────────┼──────────────────────────────┼───────────────┘
                  │                              │
                  ▼                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │ ORCHESTRATION ZONE                                           │
   │                                                              │
   │  Production factory             Prototype factory            │
   │  ──────────────────             ──────────────────           │
   │  /plan-brief                    /spark (overlaps Intent +    │
   │  /slice                          Orchestration in one tool)  │
   │  /plan-slice                    /sprint                      │
   │  /build                                                      │
   │  /harden          ◄────────────  /elevate-to-brief (BRIDGE) │
   │  /ship                                                       │
   │                                                              │
   │  7 phases, gated.               3 skills, straight-line.     │
   │  Hardening swarm.               No hardening.                │
   │  Plans audited to disk.         No plans audit.              │
   │  Per-slice PRs.                 Local-only by default.       │
   │                                                              │
   └──────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ VALIDATION ZONE                                             │
   │   E2E tests, regression sweeps, human acceptance,           │
   │   business sign-off, deployment gates.                      │
   │   Owned by humans + AI quality checks. Both factories       │
   │   hand off here via PR + their respective ship cycles.      │
   └─────────────────────────────────────────────────────────────┘
```

---

## Side-by-side comparison

| Concern | Production factory | Prototype factory |
|---------|---------------------|---------------------|
| Optimisation target | Correctness, durability, audit-able discipline | Speed, momentum, stakeholder reactability |
| Chain length | 7 phases | 3 skills |
| Gates | Confidence gate, architecture review, hardening swarm, ship review | None — just the 3-attempt failure threshold on sprint's customisation loop |
| Audit trail | Plans + metrics + execution outcomes to disk | None by design (`.claude/plans/README.md` says so explicitly) |
| Functional validation | Playwright MCP per UI slice via Sonnet subagent | Lightweight — sprint exercises the demo at boot, fixes obvious breakage |
| Branch / PR discipline | Feature branch per slice, PR per slice, branch protection enforced | Local-only by default; deferred push at developer's discretion |
| Mock vs real data | Built on synthetic; Phase 6 transitions to real via Data Integration Hardener | Synthetic by design; real integration deferred to v0.2 swap or to elevation |
| Persona modes | Critical, Strategic, Dialogic, Creative, Direct | Same |
| `agentic-safety.md` | Enforced | Enforced (safety floor stays even at hackathon speed) |
| Output style | Explanatory | Explanatory |

The two factories share **agentic safety** and **persona discipline**. Everything else is calibrated for their respective situations.

---

## The bridge: `/elevate-to-brief`

The seam between the two factories. When a hackathon demo proves out (stakeholder loved it; competition judge picked it; team wants to ship it for real), `/elevate-to-brief`:

1. **Reads the spark brief** (prototype factory format — 5 fields).
2. **Runs a schema-drift checkpoint** against the vendored production-factory schema (SHA-256 comparison; local-tampering detection only).
3. **Elicits five missing fields** — Boundaries, Affected product repos, Risk + reversibility + compliance, Constraints from upstream, Data reality decisions — that the production schema requires but spark deliberately doesn't capture.
4. **Walks the schema's 7-item enforcement checklist** against the elicited content.
5. **Writes an elevated brief** the developer manually copies into the production factory's workspace.
6. **Hands off.** The developer runs `/plan-brief` from the production factory; it accepts the elevated brief on first attempt.

**Central correctness invariant of the bridge:** if `/elevate-to-brief` ever fabricates an elicited field, it produces a brief that *looks* `/plan-brief`-acceptable but rests on invented Intent decisions. Refuse-and-surface beats smooth-it-over every time. The schema's refusal templates are the canonical phrasing.

This is the brief's central value proposition — without `/elevate-to-brief`, the prototype factory is just another demo tool. With it, hackathon demos elevate cleanly into production briefs without rebuild-from-scratch cost.

---

## Anti-patterns — when *not* to use each factory

**Don't use the production factory for:**
- Hackathon demos with one-day lifespans. The 7-phase chain's overhead is wasted on disposable work.
- Spike work that's specifically about "is this idea worth pursuing?". Use the prototype factory; if the answer is yes, elevate.
- Internal demos for business stakeholders where the goal is reactability not robustness.

**Don't use the prototype factory for:**
- Real customer-facing changes to production code. The brief explicitly strips production guardrails; using it for production work defeats the discipline.
- Anything touching real customer data, real auth, real payments, real compliance surfaces. The prototype factory is local-only by design.
- Long-running projects that need durable audit trails, slicing discipline, or hardening.

**The decision boundary:** if the work *might* prove out and need production-quality follow-through, the prototype factory is the right starting point — the elevation bridge means starting in the prototype factory has zero cost when the work graduates. If the work is *known* to be production-quality from the start (real ticket, real deadline, real users), go straight to the production factory.

---

## Per-zone non-features

These are explicit out-of-scope statements for the prototype factory:

- **Validation-zone work.** No E2E tests, no regression sweeps, no human acceptance checks built into the chain. Those happen after demos elevate to production and the production factory's `/ship` cycle hands off.
- **Production hardening.** No 7+1 hardening agent swarm. No security review, no test authoring, no resilience patterns. Hackathon demos run with no-auth, synthetic data, local-only persistence — the brief's "blast radius: developers only" assumption.
- **Cross-factory automation.** `/elevate-to-brief` doesn't invoke the production factory or copy files across workspaces. The developer carries the elevated brief manually. The factories are independent — no shell-out, no shared state beyond the vendored schema contract.

The prototype factory does **translation work** at hackathon speed. Anything that needs judgment, validation, or production-quality discipline is somebody else's job.
