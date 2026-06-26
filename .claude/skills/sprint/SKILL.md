---
name: sprint
description: Build a demo from a Spark Brief. Set a /goal so a fresh-model evaluator gates completion, copy templates/{stack}/, write code to satisfy the brief's acceptance criteria — for web, design subject-distinctive UI via /frontend-design and add a Code Velocity CTA — boot the dev server, and probe each criterion with real evidence. Straight-line: no slicing, no gates.
model: opus
---

Mode: Direct (see `.claude/rules/persona.md`) — execute; do not interview (spark did that). Go Critical only at the 3-attempt threshold (Step 5).

## Inputs

| Invocation | Behaviour |
|---|---|
| `/sprint` | Full procedure; most-recent or single brief. |
| `/sprint --brief <slug>` | Use `.claude/briefs/{slug}.md`; skip Step 1. Refuse if missing. |
| `/sprint --no-boot` | Skip Steps 6–7 (boot + exercise); hand off after customisation. |

Re-running `/sprint` re-enters customisation against the same brief.

## Procedure

### 1. Find the brief
Search `.claude/briefs/` for files carrying a `**Spark format version:**` line (v1 or v2).
- One → use it; print *"Using brief: `.claude/briefs/{slug}.md`"*.
- Many → list by modified-time descending; ask the developer to pick. Never auto-pick.
- None → refuse: *"No brief found. Run `/spark` first."*

### 2. Parse the brief
Apply the algorithm in `SPARK-BRIEF-FORMAT.md` § "Reference implementation note": check the version (refuse if > 2; a v1 brief is valid), extract the title and the six sections. `Outcome` / `Acceptance criteria` / `Runtime stack` must be non-empty; `Visual direction` / `Rubric` / `Notes` may be `(none)` (a v1 brief has no `## Visual direction` → treat as `(none)`). Refuse and name any missing section; do not improvise.

### 3. Set the goal, then preview
Set the goal first, before building, derived from the acceptance criteria:

> `/goal "every acceptance criterion in .claude/briefs/{slug}.md shows a passing WebFetch/Playwright probe result in the transcript; stop after 6 turns if not all pass"`

A separate evaluator model judges this against the transcript each turn and keeps sprint iterating until the evidence is present; `/goal clear` cancels.

Then print a 4–8 line preview: runtime stack, scaffold source (`templates/{stack}/`), user-code location (`src/demo/` web, `src/main.js` cli, free-form other), how each criterion maps to behaviour, and `--no-boot` state. If `## Rubric` is not `(none)`, append a Rubric-coverage block per `RUBRIC-BIAS.md` (visibility only). End with *"OK to proceed? (y/n)"*; proceed only on `y`/`yes`. This is a one-message preview — do not call `EnterPlanMode`.

### 4. Copy the scaffold
Copy `templates/{stack}/` into the workspace root, preserving paths. Refuse if the directory is missing (name the stack). Never overwrite existing files — on collision (e.g. `package.json`), ask the developer per file (overwrite / skip / abort).

Each `templates/{stack}/` ships: `package.json` with `dev`/`build` scripts; the user-code location above; synthetic fixtures in `src/data/synthetic/`. Extend fixtures; never delete them.

### 5. Customise

**Web stack only — visual surface (skip for `cli`/`other`):** Before writing UI, invoke the `frontend-design:frontend-design` skill (Skill tool) for distinctive-design guidance. Design **subject-distinctive** — on the audience's world, not a templated look. Take direction from `## Visual direction` when it isn't `(none)`, else infer from `## Outcome`'s audience. Author bespoke `public/index.html` + your own CSS (the skeleton ships unstyled). Weave in one lightweight link + a single CTA to `https://codevelocity.io`, styled to fit the design — not a chrome bar; add once, don't duplicate on re-run.

Write real code (components, data wiring, UI logic) in the user-code location, aimed at the acceptance criteria — exactly those, nothing adjacent. A criterion you think is missing → record it in the brief's `## Notes`; do not build it.

**3-attempt threshold:** if one criterion fails verification three times running, stop. Report the criterion, the three approaches tried, and the failure mode; ask the developer for direction. Do not loop past three.

### 6. Boot
With `--no-boot`: skip; hand off *"Scaffold ready at `<root>`. Run `npm install && npm run dev` when ready."*
Otherwise: `npm install` (on failure, refuse with the real error and roll back if feasible — never swap deps silently), then `npm run dev`, capturing the dev URL (web default `http://localhost:5173`). If no ready signal (`listening at …` or a successful HTTP response on the URL) within 60s, refuse with the dev-server output.

### 7. Exercise each criterion
For each `- ` bullet in `## Acceptance criteria`: WebFetch for rendered-content checks; Playwright MCP for interaction/console checks. Report `pass` / `fail` / `inconclusive` (one-line reason).

Paste the real probe output behind each `pass` — the `/goal` evaluator is read-only and judges only transcript evidence, so claiming an unprobed pass violates Rule 4. Probe the running demo only: do not write test files or wire CI.

On any `fail`, re-enter Step 5 with that criterion as the target (3-attempt threshold applies). The Step 3 `/goal` keeps sprint iterating until every criterion passes with evidence or the turn-cap fires.

### 8. Hand off
Print:

```
Demo running at {url}.
Acceptance criteria: {n}/{m} passing — verdict by the /goal evaluator, not self-reported.
  ✓ {criterion 1}
  ✗ {criterion 3} — {failure note}
(web) Code Velocity CTA: present

Next:
  - Iterate: re-run /sprint
  - Promote: /elevate-to-brief
  - Make durable: gh repo create codevelocitylabs/<name> --private --source . --push
  - Stop: ctrl-c the dev server   (/goal clear if the loop is still active)
```

`m/m` → *"Criteria-complete, confirmed by the `/goal` evaluator — ready for `/elevate-to-brief`."* Otherwise → *"Stopped at {n}/{m} after the 3-attempt threshold or `/goal` turn-cap on {criterion}; re-run `/sprint` to continue."* If `## Rubric` is not `(none)`, append the Rubric-coverage-at-hand-off block per `RUBRIC-BIAS.md`. For web, confirm a `codevelocity.io` link/CTA is present via a substring check on the Step-7 WebFetch — a build requirement, not a scored criterion (kept out of `## Acceptance criteria` and the `/goal` gate).

## Refusals (refuse and surface; never improvise)

| Trigger | Response |
|---|---|
| No brief in `.claude/briefs/` | *"Run `/spark` first."* |
| `--brief <slug>` missing | Print the path checked. |
| Brief version > 2 | Name the version mismatch. |
| Required section empty | Name the section. |
| `templates/{stack}/` missing | Name the stack. |
| Scaffold would overwrite a file | Ask per file. |
| `npm install` fails | Print the real error; roll back if feasible. |
| Dev server not ready in 60s | Print the dev-server output. |
| Same criterion fails 3× | Stop; surface the three attempts; ask for direction. |

## Scope
- Writes only the demo in the workspace root — no tests, no metrics, no commits, no branch, no push/PR. The developer commits.
- Rubric is visibility-only (Steps 3 and 8); it does not reorder criteria or score.
- Verification independence comes from the built-in `/goal` evaluator, not a custom verifier sub-agent.
- Web visuals are subject-distinctive via `/frontend-design`; leadgen is one Code Velocity link + CTA, not brand chrome. `cli`/`other` have no visual/CTA step.
- Too big for one pass → `/elevate-to-brief`. Sprint does not slice.
