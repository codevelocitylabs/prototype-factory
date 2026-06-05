# CLAUDE.md

Workspace conventions for the Code Velocity Labs Prototype Factory pack. Auto-loaded into every Claude Code session.

## What this repo is

The **Code Velocity Labs Prototype Factory pack** itself — a portable methodology pack (skills, rules, templates, settings) that turns a Claude Code installation into a 3-skill speed-to-demo chain: `/spark → /sprint → /elevate-to-brief`. Sibling to the production factory (private); shares safety + persona discipline, diverges on everything else.

Contains zero product code by design. Editing this repo edits the *methodology layer*, not running it against a product. See `docs/capability-model.md` for the three-zone view.

## Auto-loaded context

These files load into every session:

- `.claude/rules/agentic-safety.md` — copied verbatim from the production factory. Safety floor; non-negotiable.
- `.claude/rules/persona.md` — copied verbatim. Five named persona modes (Critical, Strategic, Dialogic, Creative, Direct).

That's it. The production factory's larger rules set (build-methodology, phase-chain-supremacy, topic-knowledge-protocol) is deliberately NOT here — the prototype factory has no 7-phase chain to govern.

## Repository layout

| Concern | Path |
|---|---|
| Three chain skills | `.claude/skills/{spark,sprint,elevate-to-brief}/SKILL.md` |
| Rubric bias sub-procedure | `.claude/skills/sprint/RUBRIC-BIAS.md` |
| Spark Brief Format spec | `.claude/skills/spark/SPARK-BRIEF-FORMAT.md` |
| Production-schema vendored | `.claude/skills/elevate-to-brief/VENDORED-SCHEMA.md` (+ `SCHEMA-CHECKSUM.json` + `MAPPING.md`) |
| Stack templates | `templates/{web,cli,other}/` |
| Auto-loaded rules | `.claude/rules/{agentic-safety,persona}.md` |
| Hooks (minimal) | `.claude/hooks/capture-session-{start,end}.sh` |
| Settings | `.claude/settings.json` (+ `settings.local.json.example`) |
| CLI distribution | `bin/cli.js` |
| Pack-level docs | `docs/{capability-model,sample-walkthrough}.md` |

## What runs automatically (hooks)

Just **session-timing capture** — `SessionStart` writes a state file, `SessionEnd` reads it for accurate duration. That's it. No phase-gate-enforcer, no architecture-reviewer prompt hook, no lint-and-log, no branch-guard. Those are production-factory discipline that the prototype factory deliberately strips.

## Common operations

| Task | How |
|---|---|
| Stamp the pack into a new workspace | `npx @codevelocitylabs/prototype-factory init <name>` |
| Force-stamp into existing dir | `npx @codevelocitylabs/prototype-factory --force` |
| Run the chain end-to-end | `claude /spark` → `/sprint` → `/elevate-to-brief` |
| Run unit tests on the CLI | `bash tests/run-all.sh` |
| Verify the install | `cat .claude/.factory-version && jq '.outputStyle' .claude/settings.json` |

## Editing the pack — guard rails

1. **Speed is the discipline.** If a change adds latency to `/spark → /sprint → demo`, it needs strong justification.
2. **Single concern per skill.** Spark elicits. Sprint builds. Elevate bridges. Don't merge concerns.
3. **Refuse-and-surface beats smooth-it-over.** The central correctness invariant for `/elevate-to-brief` — never fabricate elicited fields.
4. **`(none)` no-op paths are first-class.** When a skill's optional input is absent, the behaviour must be byte-identical to the no-input baseline.
5. **Don't import production-factory ceremony.** No slicing, no gates, no hardening swarm, no plans-to-disk audit. If you find yourself adding any of these, stop — that's a `/elevate-to-brief` candidate.
6. **Keep this CLAUDE.md ≤100 lines.** Push detail to `docs/` or `.claude/rules/`. Hard cap.

## Cross-factory contract

The prototype factory's `/elevate-to-brief` reads a **vendored copy** of the production factory's `BRIEF-INPUT-SCHEMA.md` at `.claude/skills/elevate-to-brief/VENDORED-SCHEMA.md`. When the production factory ships a schema change, the vendored copy needs a re-vendor commit here (update content, recompute SHA in `SCHEMA-CHECKSUM.json`, update `MAPPING.md` if fields changed). The schema-drift checkpoint detects local tampering only — not upstream version drift.
