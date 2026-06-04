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
/sprint                # straight-line build against the CVL DNA scaffolds
/elevate-to-brief      # (optional) bridge to the production factory
```

---

## The chain

### `/spark` — idea elicitation

A fast Dialogic interview that captures five fields (Outcome, Acceptance criteria, Runtime stack, Rubric, Notes) and writes a prototype-factory brief to `.claude/briefs/`. Deliberately faster and fewer-fields than the production factory's `/shape-brief`. Hackathon mode trusts the developer's judgement on the idea itself; no stress-testing.

Optional `--rubric <path>` pre-loads a hackathon judging rubric (or business-stakeholder priority list) — rubric-aware behaviour lights up in `/sprint`'s preview and hand-off via the `rubric-bias-logic` sub-procedure.

### `/sprint` — straight-line build

Reads the spark brief, runs a one-message Plan-Mode-lite preview, copies `templates/<stack>/` wholesale, customises to satisfy the acceptance criteria, boots the dev server, exercises the criteria, hands off. **No slicing, no gates, no hardening swarm** — sprint is the deliberate anti-pattern relative to the production factory's `/build`.

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
- **CVL DNA primitives:** design system (placeholder package name in v0.1 — see swap points below), generic team-provided knowledge data scaffolds, shared data shapes scaffolds.
- **Local-only runtime defaults:** SQLite / flat JSON persistence helpers, no-auth hardcoded user pattern, generic synthetic data fixtures (replace with your demo's real or mocked content per hackathon).
- **Two stack templates:** `templates/web/` (single-page HTML + tiny Node server, CVL DNA stylesheet) and `templates/cli/` (Node CLI). Plus `templates/other/` as a documented placeholder for non-default stacks.
- **`agentic-safety.md` + `persona.md`** auto-loaded rules.
- **Explanatory output style** by default.

---

## v0.1 → v0.2 swap points (grep `TODO` to find them all)

The pack ships honest placeholders in two places. v0.2 swaps each for real values:

1. **CVL design system stylesheet** — `templates/web/public/styles.css` is an inline-CSS placeholder shaped like Code Velocity Labs visual language. Swap for the real DS stylesheet (or `<link>` it from a published package) when promoting a demo. `npm install` is not required — `templates/web/` ships zero dependencies and boots with `node server.js`.
2. **Shared data shapes** — `templates/<stack>/src/data/synthetic/customers.json` uses a placeholder shape. Align with the real shared-data-shapes package when known.

Plus one v0.2 verification gap:

3. **End-to-end "passes `/plan-brief` on first attempt"** — `/elevate-to-brief`'s structural verification (schema-enforcement walk on the elevated brief) is rigorous, but the runtime smoke (actually running the production factory's `/plan-brief` against an elevated brief) is deferred to the first real prototype → elevation → production-factory chain run.

---

## Status — v0.1

Six slices shipped. All in working state. Two v0.2 swap points + one verification gap, all explicitly marked and documented.

| Slice | Status |
|---|---|
| 1 — pack skeleton + CLI | ✅ |
| 2 — `/spark` skill | ✅ |
| 3 — `/sprint` skill | ✅ |
| 4 — CVL DNA + local defaults (templates/web + templates/cli + settings) | ✅ (web requires v0.2 DS swap to fully run; CLI runnable now) |
| 5 — `rubric-bias-logic` (visibility-only v0.1) | ✅ |
| 6 — `/elevate-to-brief` killer feature | ✅ |
| 7 — docs + handoff (this README + install + capability model + walkthrough + CLAUDE.md) | ✅ |

---

## Branding Contract (mandatory for every prototype)

Every prototype this factory generates is a Code Velocity Labs leadgen asset. Prospects, their teams, and anyone they share the prototype with should see Code Velocity Labs attached to working software. **This is non-negotiable and applies to all output regardless of stack or template.**

### What must appear in every prototype

| Surface | Requirement |
|---------|-------------|
| **Header / top nav** | Code Velocity logo (SVG below), linking to `https://codevelocity.io` (target `_blank`, `rel="noopener"`). |
| **Footer** | `Built by Code Velocity Labs` credit with link to `https://codevelocity.io`. Persistent across every page / view. |
| **Favicon** | Code Velocity mark (the `C` + chevron from the logo). |
| **Open Graph image** | Branded OG card so any shared link previews carry the Code Velocity wordmark. |
| **Page `<title>`** | Suffix every title with `· Code Velocity Labs` (or `| Code Velocity Labs` for non-Hugo stacks). |
| **README of the generated prototype** | First line: `Prototype built by [Code Velocity Labs](https://codevelocity.io) using the Prototype Factory.` |

### Brand tokens

Use these as CSS custom properties in every web prototype:

```css
:root {
  --bg-body:        #0B0C10;
  --bg-card:        #13151A;
  --border-subtle:  #2A2F3A;
  --text-primary:   #F5F5F7;
  --text-secondary: #D1D1D1;
  --accent-glow:    #0055FF;
  --accent-hover:   #3377FF;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Load fonts from:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Logo (inline SVG)

Drop this directly into the prototype header. Wrap it in an anchor pointing to `https://codevelocity.io`.

```html
<a href="https://codevelocity.io" target="_blank" rel="noopener" aria-label="Built by Code Velocity Labs">
  <svg width="200" height="42" viewBox="0 0 240 50" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="cvl-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g transform="translate(5, 5)">
      <path d="M22 8 C 8 8, 2 16, 2 22 C 2 32, 10 38, 20 38 L 26 38 L 26 30 L 20 30 C 15 30, 10 26, 10 22 C 10 17, 15 14, 20 14 L 26 14 L 26 6 L 22 6 Z" fill="#FFFFFF"/>
      <path d="M30 6 L 42 22 L 30 38 L 38 38 L 54 22 L 38 6 L 30 6 Z" fill="#4060FF" filter="url(#cvl-glow)"/>
    </g>
    <text x="65" y="33" font-family="Inter, sans-serif" font-weight="500" letter-spacing="-0.5" fill="#FFFFFF" font-size="22">Code</text>
    <text x="118" y="33" font-family="Inter, sans-serif" font-weight="700" letter-spacing="-0.5" fill="#FFFFFF" font-size="22">Velocity</text>
  </svg>
</a>
```

For light-background prototypes, swap the `#FFFFFF` fills to `#0B0C10`.

### Footer credit (HTML)

```html
<footer style="padding: 1.5rem; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #D1D1D1;">
  Built by <a href="https://codevelocity.io" target="_blank" rel="noopener" style="color: #3377FF; text-decoration: none;">Code Velocity Labs</a>
  using the <a href="https://github.com/codevelocitylabs/prototype-factory" target="_blank" rel="noopener" style="color: #3377FF; text-decoration: none;">Prototype Factory</a>.
</footer>
```

### Non-web prototypes (CLI, scripts, services)

- **CLI tools:** print a one-line banner on first run: `Code Velocity Labs · prototype-factory · https://codevelocity.io`
- **APIs / services:** include the credit in the `/` or `/health` response payload and in the OpenAPI `info.description`.
- **Notebooks:** add a markdown cell at the top with the logo and credit.

### Enforcement

The Spark phase must inject branding into every boilerplate template by default. The Elevate phase must verify branding is present before producing the Factory Brief; if any required surface is missing, fail loud rather than silently strip the contract.
