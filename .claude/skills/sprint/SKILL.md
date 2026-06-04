---
name: sprint
description: Prototype Factory build skill. Read a Spark Brief, do one-message Plan-Mode-lite alignment, copy templates/<stack>/, customise to satisfy the brief's acceptance criteria, boot the dev server, exercise the criteria, hand off. Sprint is the straight-line anti-pattern relative to the production factory's /build — no slicing, no gates, no hardening swarm. The discipline is execute-not-deliberate.
model: opus
---

> **Persona modes: Direct + Critical** — see `.claude/rules/persona.md` §§ 'Direct' and 'Critical'. Sprint *executes*; it does not interview (that was spark). Apply Critical only when failures repeat — the 3-attempt threshold below is the structural place that fires.

# Sprint — Prototype Factory Build Skill

> **Anti-pattern discipline.** Sprint is *fork-not-clone* of the production factory's `/build`. Every time you reach for a slicing, gating, hardening, plans-to-disk, or architecture-review step, ask the Critical-mode question: *does sprint **need** this, or am I importing it by reflex?* The honest answer for hackathon mode is almost always "no". If you find yourself drafting an "audit trail" or "swarm reconciliation", stop.

---

## When this fires

- The developer invokes `/sprint` directly, typically after `/spark` produced a brief.
- The skill is the second step of the prototype factory chain: `/spark → /sprint → /elevate-to-brief (optional)`.
- Re-invoking `/sprint` against an already-built demo is supported (Step 5's customisation loop handles iteration); the skill does not refuse re-entry.

---

## Prerequisites

A Spark Brief at `.claude/briefs/{slug}.md` produced by `/spark`. That's it. No factory state required, no credentials, no external access.

If multiple briefs exist, Step 1 disambiguates. If none exist, the skill refuses (Rule 4 — explicit failure).

---

## Procedure

### 1. Brief discovery

Find Spark Briefs in `.claude/briefs/`. Filter for files matching Spark Brief Format v1 (presence of the `**Spark format version:** 1` metadata line).

- **One brief found:** use it. Print: "Using brief: `.claude/briefs/{slug}.md`."
- **Multiple briefs found:** list them by modified-time descending, ask the developer to pick one. **Do not silently pick the most recent.**
- **None found:** refuse. Print: "No spark brief found at `.claude/briefs/`. Run `/spark` first to produce one."

Argument variant: `/sprint --brief <slug>` skips discovery and loads `.claude/briefs/{slug}.md` directly. Refuse with explicit message if the named slug does not exist.

### 2. Brief parsing

Read the brief using the algorithm in `.claude/skills/spark/SPARK-BRIEF-FORMAT.md` § "Reference implementation note":

1. Check the `**Spark format version:** N` line. If `N > 1`, refuse: "Spark Brief format version `N` is newer than the version `/sprint` supports (1). Update the skill or down-version the brief."
2. Extract the level-1 heading as the idea title.
3. For each of the five required sections (`## Outcome`, `## Acceptance criteria`, `## Runtime stack`, `## Rubric`, `## Notes`), extract the content between the section heading and the next `## ` heading (or EOF).
4. Validate each section is non-empty. The literal `(none)` is acceptable for Rubric and Notes; the other three must contain real content.

If any required section is missing or empty (other than the `(none)` allowance), refuse — do not improvise.

### 3. Plan Mode lite (one-message preview, NOT actual Plan Mode)

**Critical-mode self-check before writing this section:** the production factory's `/build` uses real Claude Code Plan Mode. Sprint does NOT. Sprint is straight-line.

Print a 4–8 line preview to the developer summarising:

- Runtime stack picked (from brief's `## Runtime stack`)
- Scaffold source directory (`templates/{stack}/`)
- Where the demo's user-code will live (convention: `src/demo/` for `web`, `src/main.js` for `cli`, free-form for `other`)
- How the brief's acceptance criteria map to expected behaviour
- Whether `--no-boot` is active (skip the dev-server step)
- Whether a rubric is present in the brief's `## Rubric` section

**If the brief's `## Rubric` content is non-`(none)`**: after the 4–8 line preview, follow the sub-procedure in `./RUBRIC-BIAS.md` to emit a "Rubric coverage" block (parse dimensions, map each acceptance criterion to dimensions, surface the mapping). This is **v0.1 visibility-only bias** — the rubric is shown, not acted on. If `## Rubric` is `(none)`, this conditional is a no-op and the preview is identical to the slice-3 baseline.

End with **one** confirmation question:

> "OK to proceed? (y/n)"

Wait for explicit `y` or `yes`. Anything else aborts the sprint. **Do not enter actual Claude Code Plan Mode** — that's the heavy ceremony spark already paid for upstream. This is a single-message preview, not a planning session.

### 4. Scaffold copy

Resolve the templates directory for the brief's runtime stack: `templates/{stack}/` (e.g. `templates/web/`, `templates/cli/`, `templates/other/`).

- **Templates dir does not exist:** refuse. Print: "Templates for stack `{stack}` are not yet available in this pack version (`.claude/.factory-version`: `{ver}`). The contract is: each stack ships a copy-wholesale directory under `templates/`. Try a different stack, or wait for the slice that adds this one."
- **Templates dir exists:** copy its contents into the workspace root, preserving relative paths. Do **not** overwrite files that already exist at the destination — if the workspace already has a `package.json`, surface the collision and ask the developer (overwrite / skip / abort). Silent overwrite of developer work violates Rule 3 (irreversibility gate, blast radius applied to local files).

The templates contract (v1, established by sprint's plan, implemented by `cvl-dna-and-local-defaults` slice):

- Each `templates/<stack>/` is a copy-wholesale directory.
- Each starter ships `package.json` with `dev` and `build` scripts.
- Each starter exposes a known location for user code: `src/demo/` (web), `src/main.js` (cli), free-form with `README.md` (other).
- Each starter ships synthetic data fixtures in `src/data/synthetic/`. Sprint may extend; sprint MUST NOT delete.

### 5. Customisation (the deep work)

Read the brief's `## Outcome` and `## Acceptance criteria`. Author code in the convention-known user-code location that aims at the acceptance criteria.

**Sprint writes real code** — components, data wiring, UI logic — not just config. The discipline: aim at acceptance criteria, not at every adjacent thought. If the brief says three things must work, write code for those three things. If a fourth thing seems obviously needed, capture it in `## Notes` of the brief and **do not build it** — that's scope drift.

**The 3-attempt threshold (novel discipline — agentic-safety Rule 7, honest when caught):** if a single acceptance criterion fails verification three times in a row, **stop**. Report the criterion, the three attempted approaches, and the failure mode. Ask the developer for direction. Do not enter a self-correcting loop that masks a deeper issue.

The 3-attempt count is the v1 guess; tune based on real hackathon use. The discipline (cap re-tries, surface honestly) is non-negotiable.

### 6. Boot

If `--no-boot` was supplied: skip this step. Hand off with "Scaffold ready at `<workspace-root>`. Run `npm install && npm run dev` when ready."

Otherwise:

1. `npm install` in the workspace root. If it fails (lockfile conflict, registry timeout, missing peer dep), refuse: print the actual error and rollback the customisation if possible. Do NOT silently swap dependencies.
2. `npm run dev`. Capture the dev URL printed to stdout (the web template defaults to `http://localhost:5173`; other stacks/templates may differ).
3. If `npm run dev` does not produce a "ready" signal (a `listening at http://…` log line, or a successful HTTP response on the printed URL) within 60 seconds, refuse: surface the dev-server output, suggest the developer investigate.

### 7. Exercise the acceptance criteria

For each `- ` bullet in the brief's `## Acceptance criteria`:

- Try WebFetch against the dev URL first if the criterion is about rendered content with no required interaction (cheaper).
- Fall back to Playwright MCP when the criterion requires clicking, typing, or asserting on console state.
- Report per-criterion: `pass`, `fail`, or `inconclusive` (with a one-line note on why inconclusive).

**This is NOT Phase 5 Functional Validation in the production-factory sense.** The prototype factory has no Phase 6 to defer to — sprint owns its own boot verification. Sprint does NOT write `.spec.ts` files, does NOT add Playwright fixtures, does NOT wire CI. Sprint just probes the running demo and reports.

If any criterion fails: re-enter Step 5 (customisation) with the failure as the next target. The 3-attempt threshold from Step 5 applies — three failed customisation passes on the same criterion stops the sprint.

### 8. Hand off

Print a summary to the developer:

```
Demo running at {url}.
Acceptance criteria: {n}/{m} passing.
  ✓ {criterion 1}
  ✓ {criterion 2}
  ✗ {criterion 3} — {one-line failure note}

Next:
  - Iterate: re-run /sprint to keep customising
  - Promote: run /elevate-to-brief to produce a production-factory brief
  - Stop: ctrl-c the dev server when you're done
```

If `m/m` criteria pass: phrase the next-step block positively ("Demo is at criteria-complete state — ready for `/elevate-to-brief`").

If any criterion failed: phrase honestly ("Sprint stopped at {n}/{m} criteria after the 3-attempt threshold on {criterion}. Re-running `/sprint` will re-enter customisation. Run `/elevate-to-brief` anyway if you want to promote a partial demo and let the production factory take it from here.")

**If the brief's `## Rubric` content is non-`(none)`**: after the per-criterion summary, follow `./RUBRIC-BIAS.md` to emit a "Rubric coverage at hand-off" block — re-use the coverage mapping computed in Step 3, intersect with each criterion's pass/fail state, report per-dimension pass counts. Surfaces dimensions with no addressing criterion ("CVL DNA: 0/0 criteria addressed — consider amending the brief if this matters to your stakeholder"). If `## Rubric` is `(none)`, this conditional is a no-op.

---

## CLI variants

| Invocation | Behaviour |
|------------|-----------|
| `/sprint` | Full procedure with most-recent (or single) brief. |
| `/sprint --brief <slug>` | Explicit brief selection. Skips Step 1 disambiguation. Refuses if the slug does not exist. |
| `/sprint --no-boot` | Scaffold + customise, skip Step 6 boot and Step 7 exercise. Useful for developers who want to inspect before running. Hand-off message reflects the no-boot state. |
| `/sprint --brief <slug> --no-boot` | Both flags compose. |

---

## Refusal behaviours

Sprint refuses and surfaces explicitly. Refusals are not failures — they preserve the developer's autonomy and the contracts with upstream/downstream skills.

| Trigger | Response |
|---------|----------|
| No Spark Brief found in `.claude/briefs/` | Refuse. Print: "Run `/spark` first." |
| `--brief <slug>` points to a brief that does not exist | Refuse with the path that was checked. |
| Brief's Spark Format version > 1 | Refuse with the version mismatch. |
| Brief's required sections (Outcome / Acceptance / Runtime stack) are empty | Refuse and name which section. |
| `templates/<stack>/` does not exist | Refuse with the stack name and a note that the templates contract is per-stack. |
| Scaffold copy would overwrite existing files in workspace root | Refuse silent overwrite. Ask developer per file. |
| `npm install` fails | Refuse with actual error. Roll back customisation if feasible. |
| `npm run dev` does not signal ready within 60s | Refuse with dev-server output. |
| Same acceptance criterion fails customisation 3 times consecutively | Stop. Surface the 3 attempts honestly. Ask for direction. |

---

## What sprint does NOT do

These are explicit *non*-features. They are concerns of the production factory or future prototype-factory slices, not sprint v1.

- Does **not** write tests (`.spec.ts`, `.test.ts`, anything under `tests/`). Test authoring is a v0.2 concern; v1 sprint exercises the demo at boot and stops.
- Does **not** push, branch, or PR. Sprint operates entirely in the workspace root, local-only. Push is the developer's call, in line with the brief's local-only design.
- Does **not** apply *decision-altering* bias from the brief's `## Rubric`. v0.1 rubric-bias-logic is visibility-only — sprint surfaces the rubric-coverage map at Step 3 and Step 8 per `./RUBRIC-BIAS.md`, but does NOT auto-order acceptance criteria, NOT emphasise particular scaffolds based on rubric weight, NOT compute an aggregate score. Decision-altering bias is explicitly deferred to v0.2 (see `./RUBRIC-BIAS.md` § "v0.2 deferred bias").
- Does **not** slice the build. The demo IS the slice. If the developer's idea is too big for one `/sprint` pass, the correct move is `/elevate-to-brief` — let the production factory's `/slice` do real slicing.
- Does **not** call architecture-review, code-review, `/update-architecture`, the hardening swarm, or any production-factory discipline skill. Sprint is the **anti-pattern**; importing those defeats the brief.
- Does **not** write metrics to `.claude/metrics/`. The prototype factory has no plans-to-disk audit by design (per `.claude/plans/README.md`).
- Does **not** call `/elevate-to-brief` itself. Sprint's hand-off mentions `/elevate-to-brief` as the next-step option, but the developer triggers it.
- Does **not** auto-commit anything in the workspace root. The developer commits when they choose to (or runs `gh repo create --source . --push` when ready to make the demo durable, mirroring slice 1's Option C).

---

## Common failure modes

- **Reflexively importing `/build`'s gate / slice / hardening structure.** This is *the* failure mode for sprint. If you're writing an "execution outcome JSON" or a "code review pass" check, stop — that's `/build` discipline you don't need. Sprint is straight-line.
- **Drifting into actual Plan Mode for Step 3.** Plan Mode is a heavy primitive. Step 3's one-line preview is not Plan Mode. Do not call `EnterPlanMode`. Do not author a multi-screen plan.
- **Building beyond acceptance criteria.** Brief says three things → build three things. If you find yourself adding a fourth that "obviously belongs", you're drifting. Capture in brief's Notes, do not build.
- **Re-trying past 3 attempts.** The threshold is a discipline floor. Past 3 attempts on the same criterion, the right move is escalation, not "one more try".
- **Silently overwriting workspace files.** The scaffold-copy step's per-file overwrite refusal is the contract. Silent overwrite of a developer's `package.json` (or worse, their source files) is the kind of blast-radius mistake the brief's "blast radius: developers only" assumed wouldn't happen.
- **Treating `--no-boot` as a second-class case.** Developers who pass `--no-boot` want to inspect; they're not skipping verification by accident. Honour the flag without nagging.

---

## Hand-off (post-sprint)

After Step 8's summary, sprint stops. Next actions are the developer's:

- **Iterate on the demo:** re-run `/sprint`. The customisation loop re-engages against the same brief.
- **Promote to production:** run `/elevate-to-brief`. Sprint's output (the customised workspace + the original brief) is the input.
- **Make it durable:** `cd <workspace> && gh repo create codevelocitylabs/<workspace-name> --private --source . --push`. Sprint doesn't do this for the same reason `/spark` doesn't — Option C philosophy applies to the demo workspace just as it did to the pack itself.

That's the chain. `/spark` to start. `/sprint` to build. `/elevate-to-brief` if the demo is worth keeping. Three skills, no further ceremony.
