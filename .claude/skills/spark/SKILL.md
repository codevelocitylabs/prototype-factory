---
name: spark
description: Prototype Factory upfront alignment skill. Interview the developer through a fast 5-step elicitation, optionally accept a rubric, and write a Spark Brief Format file to .claude/briefs/. The output is the contract /sprint and /elevate-to-brief consume. Spark is deliberately faster and fewer-fields than the production factory's /shape-brief.
model: opus
---

> **Persona modes: Dialogic + Strategic** — see `.claude/rules/persona.md` §§ 'Dialogic' and 'Strategic'. The developer owns every decision; your job is to draw them out fast. One good question beats five generic ones — this is hackathon mode.

# Spark — Prototype Factory Idea Elicitation

> **Speed-to-demo discipline.** The whole prototype factory targets ≤60 minutes spark → sprint → demo. Spark itself should be **under 5 minutes** for a simple idea. If you find yourself adding a sixth field, stop — that belongs in `/elevate-to-brief`, not here.

---

## When this fires

- The developer invokes `/spark` directly. There is no upstream skill that calls it.
- It is the entry point into the prototype factory's chain: `/spark → /sprint → /elevate-to-brief (optional)`.
- It is safe to re-run on an existing brief — the procedure refuses to overwrite without explicit confirmation.

---

## Prerequisites

The developer has an idea and ~5 minutes. That's it. No prior factory state required.

If the developer has a hackathon rubric or business-stakeholder priority list, they can supply it via `--rubric <path>` to pre-load step 4.

---

## Procedure

### Step 1: Idea (the load-bearing field)

Ask **one** open question:

> "Describe the demo you want to build. Who's it for, and what's the moment they react to?"

Listen. Reflect back in 1–2 sentences. If the reflection feels off, recheck before moving on. Do not stress-test the idea — that's `/shape-brief`'s job upstream, not spark's. Hackathon mode trusts the developer's judgement on the idea itself.

### Step 2: Acceptance

Ask one Strategic question:

> "If we shipped exactly this and nothing else, what would your {audience} actually *do* with it in front of you?"

Convert the developer's answer into 2–5 observable criteria. Observable means: a third party watching the demo could check it off. "Improves the experience" is not observable; "the stakeholder can drag a customer card from To-Do into In-Progress and see it update" is observable.

If the developer's answer reduces to "feels good" or "shows progress", push back once: "What's the smallest concrete thing they'd point at and say 'that's the bit that works'?" One push-back, then accept what they offer — don't drag.

**Rubric-aware path (when `--rubric <path>` was supplied as a CLI flag):** load the rubric file content *before* this step (not after, as the default step ordering would suggest). If you have a rubric in hand, after eliciting the acceptance criteria, ask **one** optional Strategic-mode question:

> "Looking at your rubric — which of those criteria do you want this demo to make the *strongest* case for? Doesn't change what we build; helps me capture the framing in the brief for `/sprint` to highlight later."

Capture the answer in the brief's `## Notes` section (not a new field — additive within the existing 5-section schema). If the developer answers "doesn't matter" or skips, accept and move on. Hackathon mode trusts the developer.

**Step-ordering asymmetry to be aware of:** the rubric-aware question above is available *only* when the rubric is provided via the `--rubric <path>` CLI flag (loaded early). When the rubric is captured interactively at Step 4, the bias-during-acceptance opportunity has already passed — Step 4 captures the rubric verbatim and Step 5 (Notes) optionally surfaces the same follow-up question if the developer is still engaged. This asymmetry is intentional: the CLI flag indicates the developer arrived with a rubric in hand, while interactive capture means the rubric is being discovered mid-flow.

### Step 3: Runtime stack

Default to `web`. Confirm with a single line:

> "Default stack is web (single-page HTML + tiny Node server, CVL DNA stylesheet). Want that, or override to `cli` / `other`?"

Override is rare — the brief pins web as the default for stakeholder-facing demos. If they pick `other`, ask one follow-up to capture what they actually want (desktop? mobile? something else?). Record the answer verbatim.

### Step 4: Rubric (optional)

If `--rubric <path>` was supplied: skip the interview, load the file content into the brief's Rubric section verbatim. If the file does not exist on disk, **refuse and surface explicitly** — do not silently proceed without the rubric (Rule 4, explicit failure reporting).

If no `--rubric` arg: ask once:

> "Hackathon judging rubric or business-stakeholder priority list to bias against? Paste it, give me a file path, or say 'none'."

Accept whatever the developer gives. Do not stress-test the rubric's quality. If they say "none", set the Rubric section to `(none)`.

### Step 5: Notes (optional scratchpad)

> "Anything else worth capturing — references, prior art, what NOT to build?"

Free-form. If they say "no", set the Notes section to `(none)`. Move on.

### Step 6: Write the brief

Derive a kebab-case `{slug}` from the idea title (3–5 words; ask the developer if the idea is multi-paragraph and the title is ambiguous).

Write the brief to `.claude/briefs/{slug}.md` using the Spark Brief Format (see sibling file `SPARK-BRIEF-FORMAT.md`).

If `.claude/briefs/{slug}.md` already exists: refuse to overwrite. Ask the developer if they want to overwrite (require explicit `yes`), pick a different slug, or amend the existing brief.

Tell the developer:

> "Brief written to `.claude/briefs/{slug}.md`. Run `/sprint` to start building."

---

## CLI variants

| Invocation | Behaviour |
|------------|-----------|
| `/spark` | Full stepwise interview (Steps 1–6). |
| `/spark --rubric <path>` | Pre-loads rubric from file; skips Step 4's interview. Refuses if the file does not exist. |
| `/spark --quick` | One mega-prompt mode for experienced developers. Asks for all five fields in a single message: "Give me idea / acceptance / stack / rubric / notes in one go." Skip the per-step reflect-back loops. Still writes the same Spark Brief Format. |
| `/spark --quick --rubric <path>` | Quick mode + pre-loaded rubric. Asks for idea / acceptance / stack / notes only. |

`--quick` is a **first-class case**, not an afterthought. Experienced developers who already know what they want should not be forced through stepwise. Test it the same way you'd test stepwise.

---

## Refusal behaviours

Spark refuses and surfaces explicitly in these cases. Refusals are not failures — they're the skill respecting the developer's autonomy and the contract with downstream skills.

| Trigger | Response |
|---------|----------|
| `--rubric <path>` points to a file that does not exist | Refuse. Print the path that was checked, suggest the developer fix the typo or omit the flag. Do not proceed without the rubric. |
| `.claude/briefs/{slug}.md` already exists | Refuse to overwrite silently. Offer three paths: overwrite (require explicit `yes`), pick a different slug, amend in-place. |
| Developer cannot produce any acceptance criteria | After one push-back attempt, refuse to write the brief. Tell the developer: "Spark needs at least one observable criterion. Come back when you have one — or run `/shape-brief` in the production factory if you want help thinking through it." |
| Developer asks spark to invent a field for them | Refuse. Spark interviews; it does not fabricate. If the developer doesn't know the answer, that's a signal the idea isn't ready for a hackathon-speed build — surface and stop. |

---

## What this skill does NOT do

- Does **not** stress-test the idea. Hackathon mode trusts the developer.
- Does **not** elicit boundaries, affected repos, risk, constraints from upstream, or data reality decisions. Those fields are required by the production factory's `BRIEF-INPUT-SCHEMA.md` but are elicited by `/elevate-to-brief` when (and only when) the demo is being promoted to a production brief.
- Does **not** invoke the production factory. `/spark` writes a hackathon-shaped brief; `/elevate-to-brief` is what bridges the two factories.
- Does **not** write metrics, plans, or audit trail. The prototype factory has no plans-to-disk audit by design (see `.claude/plans/README.md`).
- Does **not** read or apply the rubric's bias logic. Step 4 captures the rubric verbatim; biasing is `rubric-bias-logic`'s concern (a sibling slice that lights up rubric-aware behaviour in `/spark` and `/sprint` once present).
- Does **not** validate the runtime stack against what slice 4 (`cvl-dna-and-local-defaults`) has scaffolded. Spark accepts `cli` or `other` even when only `web` scaffolds exist — the developer is on their own for non-default stacks until those scaffolds land.

---

## Common failure modes

- **Drifting into `/shape-brief` ceremony.** If you find yourself asking the developer to stress-test their outcome, you're in the wrong skill. Stop and re-read the discipline note above. Spark is deliberately fork-not-clone of shape-brief.
- **Five-field creep.** "What about ___?" is a common temptation. Refuse. Anything beyond the five fields belongs in `/elevate-to-brief`.
- **Skipping step reflection in `--quick` mode.** Just because the user wants speed doesn't mean accuracy is optional. Reflect the captured idea back in one line before writing the file, even in quick mode. One sentence — not five.
- **Silent fallback on missing rubric.** If `--rubric <path>` doesn't exist on disk and you proceed as if no rubric was supplied, you've violated Rule 4. Always refuse explicitly.
- **Inventing acceptance criteria.** If the developer can't articulate one, refuse — don't infer "what they probably meant".
- **Writing to a slug that collides** without surfacing the collision. The refusal is part of the contract — silently writing to a new slug or appending to the existing brief breaks the developer's mental model.

---

## Spark Brief Format — quick reference

See sibling file `SPARK-BRIEF-FORMAT.md` for the authoritative spec. The five required fields, in writing order:

1. **Outcome** — paragraph(s)
2. **Acceptance criteria** — bulleted list
3. **Runtime stack** — `web` / `cli` / `other`
4. **Rubric** — paste-in / file content / `(none)`
5. **Notes** — free-form / `(none)`

A YAML-front-matter version may land in v0.2 if downstream parsers want it; v0.1 is plain markdown sections.

---

## Hand-off

After writing the brief, tell the developer:

> "Brief written to `.claude/briefs/{slug}.md`. Run `/sprint` to start building."

If the rubric was supplied: add one line:

> "Rubric captured — `/sprint` and (eventually) `/elevate-to-brief` will respect it."

That's it. No `/plan-slice` recommendation, no slicing strategy, no architecture review. Spark is one step; the next step is sprint.
