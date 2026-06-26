# Prototype Factory (by Code Velocity Labs)

Also known internally as **The Hacktory**.

A raw, guardrail-free local development engine designed for rapid software prototyping and hackathon-paced builds. Built to run inside terminal environments that natively support agentic workflows, it drops standard enterprise guardrails to let an AI engineer move at thought-speed, spinning up web apps, CLI tools, and lightweight backend services in minutes.

The killer feature: once you have vibe-coded your raw prototype and pushed the boundaries of your idea, you can elevate your messy scratchpad into an enterprise-ready blueprint using the built-in `elevate-to-brief` command.

## How It Works

The Prototype Factory operates in three phases:

1. **Spark.** Fast context injection to spin up standard boilerplate templates (web, CLI, or custom raw layouts).
2. **Sprint.** Iterative, unhindered building blocks where velocity is prioritised over long-term technical debt.
3. **Elevate.** The translation layer. The engine reviews what was built, maps dependencies, extracts the core intent, and exports an optimised *Factory Brief*.

## Installation & Setup

Ensure you have your environment configured with an active AI terminal agent workspace.

1. Clone the repository:
   ```bash
   git clone https://github.com/codevelocitylabs/prototype-factory.git
   cd prototype-factory
   ```

**Prerequisites:** Claude Code CLI, Git 2.40+, Node 22+. No `gh` auth needed for the local-only stamp; only the deferred-push step needs it.

See `install.md` for the full guide.

### Quick start

Three commands, three skills, one bridge:

```bash
npx @codevelocitylabs/prototype-factory init my-demo-idea
cd cvl-my-demo-idea
claude
```

Then inside Claude Code:

```
/spark                 # ~5-minute interview that captures the idea
/sprint                # straight-line build; web UI designed per-demo
/elevate-to-brief      # (optional) bridge to the production factory
```

---

## The chain

### `/spark` — idea elicitation

A fast Dialogic interview that captures six fields (Outcome, Acceptance criteria, Runtime stack, Visual direction, Rubric, Notes) and writes a prototype-factory brief to `.claude/briefs/`. Deliberately faster and fewer-fields than the production factory's `/shape-brief`. Hackathon mode trusts the developer's judgement on the idea itself; no stress-testing.

Optional `--rubric <path>` pre-loads a hackathon judging rubric (or business-stakeholder priority list) — rubric-aware behaviour lights up in `/sprint`'s preview and hand-off via the `rubric-bias-logic` sub-procedure.

### `/sprint` — straight-line build

Reads the spark brief, runs a one-message Plan-Mode-lite preview, copies `templates/<stack>/` wholesale, customises to satisfy the acceptance criteria — web UIs are designed subject-distinctive via `/frontend-design`, with a discreet Code Velocity CTA — boots the dev server, exercises the criteria, hands off. **No slicing, no gates, no hardening swarm** — sprint is the deliberate anti-pattern relative to the production factory's `/build`.

Novel discipline: a 3-attempt failure threshold on the customisation loop. After three failed re-tries on the same acceptance criterion, sprint stops and surfaces — agentic-safety Rule 7 (honest when caught) applied to build-time.

### `/elevate-to-brief` — the killer feature

Reads the spark brief, runs a schema-drift checkpoint against the vendored production-factory schema, elicits the five fields spark deliberately doesn't capture (Boundaries, Affected repos, Risk/reversibility/compliance, Constraints from upstream, Data reality decisions), writes a production-factory-compliant brief.

**The central correctness invariant:** if `/elevate-to-brief` ever fabricates an elicited field, it produces a brief that *looks* `/plan-brief`-acceptable but rests on invented Intent decisions. Refuse-and-surface beats smooth-it-over every time. The schema's refusal templates are the canonical phrasing.

---

## How this differs from the production factory

> **This is not the production factory.** This pack deliberately strips hardening, architecture review, the confidence gate, functional-validation rigour, and plans-to-disk audit. The point is acceleration without those production guardrails. The production factory is a separate, private Code Velocity Labs pack.

| Production factory | Prototype factory |
|---|---|
| 7-phase chain with explicit gates | Stripped chain (`/spark → /sprint → /elevate-to-brief`) |
| 7+1 hardening agent swarm | No hardening — speed, not safety-by-construction |
| Architecture review per slice | No architecture review |
| Confidence gate per slice | No confidence gate |
| Functional validation via Playwright per UI slice | Lightweight — exercise the demo, fix obvious breakage |
| Plans audited to disk under `.claude/plans/` | No plans-to-disk audit |
| Per-slice PRs, branch protection, full ship cycle | No PR cycle by default; deferred-push at the developer's discretion |
| `agentic-safety.md` enforced | `agentic-safety.md` enforced (safety floor stays at hackathon speed) |
| Persona modes (Critical, Strategic, Dialogic, Creative, Direct) | Same persona modes |
| Explanatory output style | Same Explanatory output style |

The two factories share **agentic safety** and **persona discipline**. Everything else is calibrated for speed.

See `docs/capability-model.md` for the three-zone (Intent / Orchestration / Validation) view of where each factory sits and how `/elevate-to-brief` bridges them.

---

## What's in the box

Stamped workspaces (via `init` or force-stamp) get:

- **Three chain skills:** `/spark`, `/sprint`, `/elevate-to-brief` plus the `rubric-bias-logic` sub-procedure (consumed by `/sprint` when a rubric is present).
- **Local scaffolds:** generic team-provided knowledge data scaffolds and shared data shapes scaffolds. Web visuals are generated per-demo by `/frontend-design` — no bundled design system.
- **Local-only runtime defaults:** SQLite / flat JSON persistence helpers, no-auth hardcoded user pattern, generic synthetic data fixtures (replace with your demo's real or mocked content per hackathon).
- **Two stack templates:** `templates/web/` (single-page HTML + tiny Node server, unstyled skeleton — visuals designed per-demo) and `templates/cli/` (Node CLI). Plus `templates/other/` as a documented placeholder for non-default stacks.
- **`agentic-safety.md` + `persona.md`** auto-loaded rules.
- **Explanatory output style** by default.

---

## v0.1 → v0.2 swap points (grep `TODO` to find them all)

The pack ships one honest placeholder. v0.2 swaps it for real values:

1. **Shared data shapes** — `templates/<stack>/src/data/synthetic/customers.json` uses a placeholder shape. Align with the real shared-data-shapes package when known.

(Web visuals are no longer a swap point — `templates/web/` ships an unstyled skeleton with zero dependencies, boots with `node server.js`, and `/sprint` designs the UI per-demo via `/frontend-design`.)

Plus one v0.2 verification gap:

2. **End-to-end "passes `/plan-brief` on first attempt"** — `/elevate-to-brief`'s structural verification (schema-enforcement walk on the elevated brief) is rigorous, but the runtime smoke (actually running the production factory's `/plan-brief` against an elevated brief) is deferred to the first real prototype → elevation → production-factory chain run.

---

## Status — v0.1

Six slices shipped. All in working state. One v0.2 swap point + one verification gap, all explicitly marked and documented.

| Slice | Status |
|---|---|
| 1 — pack skeleton + CLI | ✅ |
| 2 — `/spark` skill | ✅ |
| 3 — `/sprint` skill | ✅ |
| 4 — Templates + local defaults (templates/web + templates/cli + settings) | ✅ (web boots unstyled, styled per-demo by `/frontend-design`; CLI runnable) |
| 5 — `rubric-bias-logic` (visibility-only v0.1) | ✅ |
| 6 — `/elevate-to-brief` killer feature | ✅ |
| 7 — docs + handoff (this README + install + capability model + walkthrough + CLAUDE.md) | ✅ |

---

## Leadgen (lightweight)

Every **web** demo carries a discreet link + a single call-to-action back to Code Velocity Labs (`https://codevelocity.io`), woven into the demo's own subject-distinctive design by `/sprint`. That is the whole requirement — no mandatory logo, footer-on-every-view, favicon, Open Graph image, or `<title>` suffix. `cli` / `other` stacks carry no leadgen requirement.

The thesis: a demo that looks like the *prospect's* own product impresses more than one wearing a house style, and the CTA still routes the viewer back to Code Velocity.
