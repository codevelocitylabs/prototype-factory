---
name: spark
description: Elicit a demo idea from the developer in a fast interview (incl. optional visual direction), optionally run an uncapped research swarm to pressure-test it, then write a Spark Brief to .claude/briefs/{slug}.md. The brief is the contract /sprint and /elevate-to-brief consume.
model: opus
---

Mode: Dialogic (see `.claude/rules/persona.md`) — the developer owns every decision; draw it out fast. One good question beats five. Capture the idea; do not stress-test it.

Output: a brief in the six-section Spark Brief Format — `Outcome`, `Acceptance criteria`, `Runtime stack`, `Visual direction`, `Rubric`, `Notes`. Authoritative spec: `SPARK-BRIEF-FORMAT.md`. Never add a seventh field — promotion concerns (boundaries, risk, repos) belong to `/elevate-to-brief`.

## Inputs

| Invocation | Behaviour |
|---|---|
| `/spark` | Steps 1–8 (interview + research swarm). |
| `/spark --rubric <path>` | Load rubric from the file at Step 5. Refuse if missing. |
| `/spark --no-research` | Skip Step 7. Composes with any flag. |
| `/spark --quick` | Ask for all six fields in one message; skip per-step reflect-back; implies `--no-research`. Still reflect the idea back in one line before writing. |

## Procedure

### 1. Idea
Ask: *"Describe the demo you want to build. Who's it for, and what's the moment they react to?"* Reflect back in 1–2 sentences; recheck if it feels off.

### 2. Acceptance criteria
Ask: *"If we shipped exactly this and nothing else, what would your {audience} do with it in front of you?"* Convert the answer into 2–5 **observable** criteria — a third party watching the demo can check each off. (*"drags a card from To-Do to In-Progress and sees it update"* is observable; *"improves the experience"* is not.) If the answer is vague, push back once: *"What's the smallest concrete thing they'd point at and say 'that works'?"* Then accept what's offered.

If a rubric was supplied via `--rubric`, load it now and ask once: *"Which rubric criteria should this demo make the strongest case for?"* Record the answer in `## Notes`.

### 3. Runtime stack
Ask: *"Default stack is web (single-page HTML + tiny Node server; visuals designed per-demo). Keep web, or override to `cli` / `other`?"* For `other`, ask one follow-up and record the answer verbatim.

### 4. Visual direction
Web stack only (else `(none)`). Ask once, optional: *"Any visual direction — whose look-and-feel should this echo? The audience's world, a brand, a reference site? (skip if none)"* Record verbatim in `## Visual direction`; skipped or no answer → `(none)`.

### 5. Rubric
With `--rubric <path>`: load the file verbatim into `## Rubric`; refuse if missing. Otherwise ask: *"Judging rubric or stakeholder priority list to capture? Paste it, give a path, or say 'none'."* Capture verbatim; `none` → `(none)`. Do not assess rubric quality.

### 6. Notes
Ask: *"Anything else to capture — references, prior art, what NOT to build?"* Free-form; *"no"* → `(none)`.

### 7. Research swarm
Skip entirely under `--no-research` or `--quick` (behaviour is then identical to interview-only).

Otherwise tell the developer: *"Running independent research — competitors, prior art, what others have tried — to pressure-test the brief. Takes a few minutes; skip next time with `--no-research`."* Then invoke a dynamic workflow, **coverage-driven with no agent cap** (the subject sets the scale):

1. **Scope** — one agent decomposes the brief into research dimensions emergently: subject expertise, competitive landscape, prior art, adjacent approaches, feasibility, what-not-to-build.
2. **Fan out** — one web-research agent (WebSearch/WebFetch) per sub-question; tens of agents for a rich subject, fewer for a narrow one.
3. **Critic loop** — an agent asks *"what's still uncovered?"* and triggers another round; stop when a round finds nothing new.
4. **Synthesize** — compress findings to a short digest: landscape, prior art, contradictions with the elicited direction, what-not-to-build.

Present the digest to the developer as decisions — especially contradictions (*"a shipped product already does this"*). The developer decides each; never fold a finding in without sign-off. Land accepted findings in **existing** sections: prior art / competitive notes / what-not-to-build → `## Notes`; sharpened wording → `## Outcome` or `## Acceptance criteria`.

### 8. Write
Derive a kebab-case `{slug}` (3–5 words) from the idea title; ask if ambiguous. Write the brief to `.claude/briefs/{slug}.md`. If it exists, refuse to overwrite — offer overwrite (explicit `yes`), a new slug, or amend in place. Then: *"Brief written to `.claude/briefs/{slug}.md`. Run `/sprint` to build."* If a rubric was captured, add: *"Rubric captured — `/sprint` will respect it."*

## Refusals (refuse and surface; never improvise)

| Trigger | Response |
|---|---|
| `--rubric <path>` missing on disk | Print the path checked; do not proceed without the rubric. |
| `.claude/briefs/{slug}.md` exists | Offer overwrite (`yes`) / new slug / amend. |
| No acceptance criterion after one push-back | *"Spark needs at least one observable criterion."* Stop. |
| Developer asks spark to invent a field | Refuse — spark captures, it does not fabricate. |

## Scope
- Captures exactly six fields. Promotion fields (boundaries, repos, risk, constraints, data) belong to `/elevate-to-brief`.
- Captures the rubric verbatim; does not apply rubric bias (that is `rubric-bias-logic`).
- Accepts `cli` / `other` even when only `web` templates exist; the developer owns non-default stacks.
- The research swarm shapes the brief only — it surfaces findings for the developer to accept, and never gates, scores, or adds a section.
- Writes only the brief — no metrics, plans, or audit trail.
