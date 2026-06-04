---
name: elevate-to-brief
description: Prototype Factory bridge skill. Read a Spark Brief, run a schema-drift checkpoint against the vendored production-factory BRIEF-INPUT-SCHEMA.md, elicit the 5 fields Spark deliberately doesn't capture (boundaries, affected repos, risk, constraints, data reality), write a production-factory-compliant brief the developer hands off manually. The killer feature — the seam from hackathon demo to production-factory brief that passes /plan-brief on first attempt.
model: opus
---

> **Persona modes: Dialogic + Strategic** — see `.claude/rules/persona.md` §§ 'Dialogic' and 'Strategic'. The developer owns every elicited Intent decision; your job is to draw them out and refuse fabrication when they hesitate. This is the same discipline `/shape-brief` applies in the production factory — and the same refusal templates.

# Elevate to Brief — Prototype → Production Bridge

> **Central correctness invariant.** If this skill ever fabricates a Boundary, an Affected repo, a Risk note, a Constraint, or a Data reality decision the developer didn't actually make, it produces a brief that *looks* `/plan-brief`-acceptable but rests on invented Intent decisions. That defeats the brief's killer-feature acceptance criterion ("passes /plan-brief on first attempt") AND violates agentic-safety Rule 4 (explicit failure reporting). **Refuse-and-surface beats smooth-it-over every time.**

---

## When this fires

- The developer invokes `/elevate-to-brief` after `/spark` and (typically) `/sprint` have produced something worth keeping.
- The skill is the **third and final step** of the prototype factory chain: `/spark → /sprint → /elevate-to-brief (optional)`. Optional because not every demo needs to graduate to the production factory; sometimes a hackathon demo is its own destination.
- Re-running against an already-elevated brief is supported with explicit overwrite confirmation (see refusals below).

---

## Prerequisites

A Spark Brief at `.claude/briefs/{slug}.md` produced by `/spark`. That's it. No factory state, no credentials, no external access.

If the developer hasn't run `/sprint` yet, elevation still works — the elevated brief is shaped from the Spark Brief alone, not from any demo state. But the elevated brief makes most sense after the developer has a working demo to point at.

---

## Procedure

### 1. Brief discovery

Find Spark Briefs in `.claude/briefs/`. Filter for files containing `**Spark format version:** 1` (the v1 metadata marker).

- **One brief found:** use it. Print: "Elevating brief: `.claude/briefs/{slug}.md`."
- **Multiple briefs found:** list them by modified-time descending, ask the developer to pick. **Do not silently pick the most recent.**
- **None found:** refuse. Print: "No spark brief found in `.claude/briefs/`. Run `/spark` first to produce one, then `/sprint` to build it, then come back here."

CLI variant: `/elevate-to-brief --brief <slug>` skips discovery and loads `.claude/briefs/{slug}.md` directly. Refuse if the named slug doesn't exist.

### 2. Schema-drift checkpoint

Verify the vendored production-factory schema hasn't been locally tampered with. Per `./SCHEMA-CHECKSUM.json`:

1. Read `./VENDORED-SCHEMA.md`.
2. Strip the first 4 lines (the vendoring metadata header — see TG1 of slice 6's plan).
3. Compute SHA-256 of the remaining content.
4. Compare against `SCHEMA-CHECKSUM.json#sha256`.

If the SHA matches: proceed.

If the SHA mismatches: refuse. Print:

> "Schema-drift checkpoint failed. The vendored production-factory schema at `.claude/skills/elevate-to-brief/VENDORED-SCHEMA.md` has been edited locally — its content no longer matches the recorded SHA-256 in `SCHEMA-CHECKSUM.json`.
>
> Restore the vendored copy: `git checkout HEAD -- .claude/skills/elevate-to-brief/VENDORED-SCHEMA.md` from the prototype-factory checkout.
>
> Or if the production factory has shipped a schema update: re-vendor by copying the latest `BRIEF-INPUT-SCHEMA.md` from `production-factory (private)/.claude/skills/shape-brief/` and updating both `VENDORED-SCHEMA.md`'s header (last-vendored date, source commit) and `SCHEMA-CHECKSUM.json#sha256` to match."

**Critical-mode scope-pin:** this checkpoint detects **local tampering only.** It does NOT fetch the live production-factory schema and compare. Production-factory schema version drift (their upstream changes) is handled by manual re-vendoring, not by runtime detection. This asymmetry honours the brief's local-only design.

### 3. Read and parse the Spark Brief

Use the algorithm in `.claude/skills/spark/SPARK-BRIEF-FORMAT.md` § "Reference implementation note":

1. Verify `**Spark format version:** N`. Refuse if `N > 1`.
2. Extract title (level-1 heading), Outcome, Acceptance criteria, Runtime stack, Rubric, Notes.
3. Validate each required section is non-empty (`(none)` is the documented empty marker for Rubric / Notes).

### 4. Apply direct mappings

Per `./MAPPING.md`, no interaction needed:

- Title → production title (verbatim)
- Outcome → production Outcome (verbatim)
- Acceptance criteria → production Success criteria (rename only)
- Notes + Rubric (when non-`(none)`) → combined into production Crew refinement notes

### 5. Elicit brief id

Check for `--brief-id <KEY>` CLI flag.

- **Flag supplied:** validate `^[A-Z]+-[0-9]+$`. If valid, use it. If invalid, refuse and ask for a valid format.
- **Flag absent:** ask the developer once:

  > "Do you have a Jira (or other tracker) key for the production version of this work — e.g. `PROJ-123` — or should I leave it blank for the production factory's `/plan-brief` to synthesise `WORK-N` when it runs?"

  Accept any valid key or "no key / blank / WORK-N please" / silence. Don't drag.

### 6. Elicit the 5 missing fields

This is the **load-bearing** elicitation. Dialogic + Strategic discipline applies: one good question per field, push back **once** on vagueness, accept the second answer, **refuse if the developer can't answer at all** — never fabricate.

Walk the 5 elicitations in order, per `./MAPPING.md`:

1. **Boundaries (in / out of scope)** — ask the prompt from MAPPING.md § Boundaries. Capture both in and out lists. Refuse if neither is offered.
2. **Affected product repos** — ask the prompt from MAPPING.md § Affected. Suggest the auto-translation from Spark's runtime stack as a starting answer the developer can override. Refuse "unknown" — that's an Intent decision.
3. **Risk and reversibility** — ask the three sub-questions together. Capture blast radius, reversibility, compliance touch points. Refuse if any sub-field is blank.
4. **Constraints from upstream** — ask the prompt from MAPPING.md § Constraints. Accept "none additional beyond rules" as a valid answer per schema § 'Schema enforcement'.
5. **Data reality decisions** — ask per touchpoint identified from Spark's runtime stack + slice 4's templates' data inventory (customer data, design system, local persistence, plus any team-specific data sources the demo introduced — adjust per MAPPING.md). **Refuse `Unknown`** with the schema's refusal template verbatim.

For each push-back, follow `/shape-brief`'s pattern: one polite second question, then accept what the developer offers. Do not drag.

### 7. Schema enforcement walk (Critical-mode self-check)

Walk the vendored schema's "Schema enforcement" 7-item checklist against the in-memory elevated brief content. Each item ticked or surface:

```
[ ] Outcome stated (paragraph, not single sentence)
[ ] Success criteria — at least 2, each observable
[ ] Boundaries — at least one in-scope and one out-of-scope item
[ ] Affected product repos — at least one
[ ] Risk + reversibility + compliance noted
[ ] Constraints from upstream — at least "none additional beyond rules"
[ ] Data reality decisions — every touchpoint has a mode (no Unknown)
```

Any unticked item → loop back to the corresponding elicitation step. Two passes max per item — if it still doesn't tick, refuse and surface the gap.

### 8. Refuse `Unknown` data reality (verbatim from schema)

If any data touchpoint's mode is `Unknown`, refuse with the schema's canonical phrasing:

> "This brief contains **Unknown** data reality for touchpoint **\[name\]**. Intent zone must decide which mode each external data dependency operates in before the factory can plan. See `BRIEF-INPUT-SCHEMA.md` § 7."

This is the only refusal whose phrasing is dictated verbatim by the vendored schema. Use it exactly.

### 9. Write the elevated brief

Resolve the output path:

- If `--brief-id <KEY>` was supplied: `.claude/briefs/{KEY}-{slug}.md` (matches production-factory naming convention).
- Otherwise: `.claude/briefs/elevated-{slug}.md`.

If the path already exists, refuse silent overwrite. Ask the developer (overwrite / pick different slug / amend in-place). The sibling `.zip` path (see Step 9.5) is treated as part of the same artifact — overwrite or refuse them together; never overwrite one without the other.

Write the elevated brief content using the production-schema field order:

```markdown
# {Brief title}

**Brief id:** {KEY or "(none supplied — production factory will synthesise WORK-N)"}
**Elevated from:** `.claude/briefs/{spark-brief-slug}.md` on {ISO date} (prototype factory v{version})

## Outcome
{verbatim from spark}

## Success criteria
{spark's Acceptance criteria, list preserved}

## Boundaries
**In scope:** ...
**Out of scope:** ...

## Affected product repos
- ...

## Risk and reversibility
- **Blast radius:** ...
- **Reversibility:** ...
- **Compliance touch points:** ...

## Constraints from upstream
- ...

## Data reality decisions
| Touchpoint | Mode | Notes |
|------------|------|-------|
| ... | ... | ... |

## Crew refinement notes
{spark's Notes + Rubric, when non-(none)}
```

### 9.5. Package the brief as a downloadable zip

Skip this step entirely if `--dry-run` was supplied — the dry-run promise is "no files written," and that includes the zip.

Otherwise, package the just-written brief into a sibling zip at `.claude/briefs/{filename}.zip` so the developer has a single downloadable artifact to carry into the production factory:

1. The zip contains exactly **one entry**: the elevated brief `.md`, stored at the top level using its bare filename (no `.claude/briefs/` prefix inside the archive). This lets the developer extract directly into a target factory's `.claude/briefs/` without nested-directory cleanup.
2. Use whichever zipping tool is available on the platform — Python's `zipfile` module is the most portable default and is almost always installed:
   ```bash
   python -c "import zipfile, sys; zipfile.ZipFile(sys.argv[2], 'w', zipfile.ZIP_DEFLATED).write(sys.argv[1], arcname=sys.argv[1].split('/')[-1])" .claude/briefs/{filename}.md .claude/briefs/{filename}.zip
   ```
   On Windows where Python isn't on PATH, PowerShell's `Compress-Archive -Path ... -DestinationPath ...` is the fallback. On Unix without Python, `zip -j` is the fallback (the `-j` is load-bearing — it strips the `.claude/briefs/` prefix, matching the "bare filename" requirement above).
3. If the zip write fails (no available tool, permissions, etc), do **not** silently fall back to the old `cp`-recipe hand-off — surface the failure per agentic-safety Rule 4 and ask the developer to install one of the tools above. The zip is the documented hand-off artifact; a missing zip is a gap, not a smoothable miss.
4. Refuse silent overwrite of an existing zip with the same logic as Step 9's `.md` overwrite refusal — the two files travel together.

### 10. Hand off

Print the next-step block to the developer:

```
Elevated brief written to .claude/briefs/{filename}.md
Handoff package written to .claude/briefs/{filename}.zip
✓ Schema-drift checkpoint passed
✓ All 7 schema enforcement items ticked
✓ No Unknown data reality modes

To hand off to the production factory:
  1. Download .claude/briefs/{filename}.zip from this workspace.
  2. Extract it into the production-factory workspace's .claude/briefs/ directory
     (the archive contains the brief at the top level, so extraction lands the file
     directly — no nested folder cleanup).
  3. From the production factory's workspace, run:
       /plan-brief .claude/briefs/{filename}.md
  4. /plan-brief should accept this on first attempt. If it refuses with a schema-enforcement gap,
     come back here and re-shape the corresponding elicited field — that's a gap in this elevation,
     not a gap in the production factory.
```

For `--dry-run`, replace "Handoff package written to ..." with "Handoff package would be written to .claude/briefs/{filename}.zip (skipped: --dry-run)" so the dry-run output still describes the full eventual artifact set.

---

## CLI variants

| Invocation | Behaviour |
|------------|-----------|
| `/elevate-to-brief` | Use most-recent Spark Brief, no brief-id (let production factory synthesise WORK-N). |
| `/elevate-to-brief --brief <slug>` | Explicit Spark Brief selection. |
| `/elevate-to-brief --brief-id <KEY>` | Supply a real Jira (or other tracker) key. Validates `^[A-Z]+-[0-9]+$`. |
| `/elevate-to-brief --dry-run` | Run the full procedure (including 5-field elicitation + schema enforcement walk) BUT do not write the elevated brief file. Print what *would* be written. Useful for testing the chain end-to-end without producing a file the developer has to clean up. |
| Combinations | All four flags compose. E.g. `/elevate-to-brief --brief my-demo-idea --brief-id PROJ-123 --dry-run`. |

---

## Refusal behaviours

| Trigger | Response |
|---------|----------|
| No Spark Brief found in `.claude/briefs/` | Refuse with "Run `/spark` first." |
| Named brief slug (`--brief <slug>`) doesn't exist | Refuse with the path that was checked. |
| Spark Format version > 1 | Refuse with version mismatch. |
| Schema-drift checkpoint fails (vendored SHA mismatch) | Refuse with restore instructions (see Step 2). |
| Developer can't answer any of the 5 elicited fields (Boundaries / Affected repos / Risk / Constraints / Data reality) after one push-back | Refuse and surface the specific field. Do NOT fabricate. The schema's refusal templates are the canonical phrasing. |
| Developer declares any data touchpoint mode as `Unknown` | Refuse verbatim with the schema's Step 8 template. |
| `--brief-id` doesn't match `^[A-Z]+-[0-9]+$` | Refuse and ask for a valid id or omission. |
| Elevated brief file path already exists | Refuse silent overwrite. Ask developer (overwrite / pick different slug / amend in-place). Same logic applies to the sibling `.zip` — `.md` and `.zip` overwrite-refuse together. |
| Zip-creation tool unavailable (no Python, PowerShell, or `zip` on PATH) | Refuse and surface — do NOT silently revert to the old `cp`-recipe hand-off. The zip is the documented artifact. |

---

## What `/elevate-to-brief` does NOT do

- Does **not** invoke the production factory. No shell-out, no PR creation, no cross-factory file copy. The developer carries the elevated brief (as the downloadable `.zip` from Step 9.5) into the production factory manually.
- Does **not** modify the original Spark Brief. Elevation is a write of a new file pair (`elevated-{slug}.md` + `elevated-{slug}.zip`, or the `{KEY}-{slug}` variants).
- Does **not** slice the work or pre-empt Phase 2. The production factory's `/slice` runs against the elevated brief from a clean start.
- Does **not** fabricate any of the 5 elicited fields. Refuse-and-surface is the central correctness invariant — see the warning at top of this file.
- Does **not** auto-fetch the production-factory schema. The vendored `VENDORED-SCHEMA.md` is the source of truth; manual re-vendoring is the upgrade path. The schema-drift checkpoint detects local tampering only, not cross-factory version drift.
- Does **not** validate against `/plan-brief` directly. The schema-enforcement walk at Step 7 is the structural verification; full end-to-end "passes /plan-brief on first attempt" verification requires actually running the production factory's `/plan-brief` against an elevated brief (v0.2 gap).
- Does **not** transition any external tracker (Jira). If `--brief-id` was supplied, the production factory's own brief-tracking integration handles transitions; elevate-to-brief just embeds the id in the elevated brief.

---

## Common failure modes during build / use

- **Drifting into fabrication.** "The developer said 'I don't know' for Boundaries; surely I can infer from the demo what's adjacent…" — STOP. That's the central-correctness-invariant violation. Refuse and surface the gap.
- **Expanding the schema-drift checkpoint to fetch live schema.** Don't. The bounded scope is correct discipline — network-dependent live-fetch breaks the brief's local-only design.
- **Smoothing over partial answers.** Half-answers are not answers. If the developer gives a partial Risk note (e.g. only blast radius, no reversibility), push back once for the full triple — if still partial, refuse and surface.
- **Skipping the schema-enforcement walk.** Step 7 is the structural verification. Don't shortcut.
- **Treating `--dry-run` as a second-class case.** Same lesson as slice 3's sprint `--dry-run` and slice 1's CLI `--dry-run` — testability matters. Honour the flag.
- **Writing the elevated brief before all 7 enforcement items tick.** The file write at Step 9 is the commit point. If Step 7's walk has any unticked items, do NOT write — loop back to elicitation.
- **Inventing data touchpoints the developer didn't enumerate.** For `web` and `cli` stacks, the default touchpoint list (customer data, design system, local persistence) is a *suggestion* — the developer can add or remove. For `other` stacks, no defaults are auto-suggested. Don't pad the list to match the schema's expectations.

---

## Hand-off

After Step 10's summary, this skill stops. Next is the developer's:

- **Download and feed:** download the `.zip` from this workspace, extract it into the production-factory workspace's `.claude/briefs/`, and run `/plan-brief` there.
- **Iterate:** if `/plan-brief` refuses (schema-enforcement gap), come back to `/elevate-to-brief` and re-shape the gap.
- **Re-elevate:** if the demo changes substantially, re-run `/elevate-to-brief` on the updated Spark Brief; the procedure refuses silent overwrite of both the `.md` and the sibling `.zip` so the developer chooses.

The chain ends here. `/spark → /sprint → /elevate-to-brief → (production factory).` Three skills, one bridge, no further prototype-factory ceremony.
