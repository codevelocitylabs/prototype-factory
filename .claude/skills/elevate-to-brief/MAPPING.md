# Spark → Production Schema Field Mapping

**Format version:** 1
**Reads:** `./VENDORED-SCHEMA.md` (the vendored production-factory `BRIEF-INPUT-SCHEMA.md`)
**Consumed by:** `./SKILL.md` at elevation time

This document is the explicit, audit-able contract that `/elevate-to-brief` follows when translating a Spark Brief (the prototype factory's 5-field idea-capture shape) into a production-factory brief (the 7-required-field `BRIEF-INPUT-SCHEMA.md` shape). Field-by-field, with elicitation prompts for the gaps.

---

## Direct mappings (no elicitation needed)

Fields the Spark Brief already carries, copied or renamed into the production brief:

| Spark Brief field | Production schema field | Transform |
|--------------------|--------------------------|-----------|
| Brief title (level-1 heading) | Brief title (level-1 heading) | Verbatim. |
| `## Outcome` | `## Outcome` | Verbatim. Production schema requires a paragraph; Spark already enforces this. |
| `## Acceptance criteria` | `## Success criteria` | Section heading renamed; bullet list copied verbatim. |
| `## Notes` (if non-`(none)`) + `## Rubric` (if non-`(none)`) | `## Crew refinement notes` | Combined. Notes content first, then a sub-section `### Rubric` containing the rubric content. If both are `(none)`, the production-brief section reads `*No additional Crew refinement notes captured at elevation.*` |

---

## Elicited fields (Spark doesn't carry — `/elevate-to-brief` MUST ask)

For each field below, the SKILL.md procedure runs a Dialogic + Strategic prompt. Refuse and surface if the developer can't answer — do NOT fabricate. Mirror the production factory's `/shape-brief` refusal templates verbatim.

### `## Boundaries (in / out of scope)`

**Elicitation prompt:**

> "What's adjacent to your demo that you deliberately *aren't* asking the production factory to build? Both directions — what's clearly in scope for the production version, and what's explicitly out of scope (a related feature the team should NOT pull in by reflex)."

**Required output shape:**

```markdown
**In scope:**
- {item 1}
- {item 2}

**Out of scope:**
- {item 1}
- {item 2}
```

Refuse if the developer can't name at least one in-scope and one out-of-scope item.

---

### `## Affected product repos`

**Elicitation prompt:**

> "When this becomes a production change, which production repos does it touch? Or is it a new repo? List each by name + one-line note on what changes there."

**Required output shape:**

```markdown
- `<repo-name>` — <what changes>
```

Spark's `## Runtime stack` value translates additionally:

- `web` → suggest "new MFE repo to be created (single-page HTML + tiny Node server)" as a starting answer; developer can override with an existing MFE repo name if extending rather than creating, or upgrade to a framework if production scope warrants it.
- `cli` → suggest "new CLI tool to be created (Node)" OR "existing CLI tool to be extended"; developer picks.
- `other` → no auto-suggestion; the developer's `other: <description>` from the Spark Brief seeds the question but the affected-repo answer is the developer's call.

Refuse if "unknown" — that's a planning question for Intent, not something elevate-to-brief can answer.

---

### `## Risk and reversibility`

**Elicitation prompt** (three quick sub-questions, asked together):

> "Three quick things about the production version:
> 1. Blast radius if it goes wrong: one user / many users / regulator-visible?
> 2. Reversibility: instant rollback / DB migration involved / external service updated?
> 3. Compliance touch points: PII / payments / audit / regulatory / none?"

**Required output shape:**

```markdown
- **Blast radius:** {one user / many users / regulator-visible / methodology only}
- **Reversibility:** {instant rollback / DB migration / external service / n/a}
- **Compliance touch points:** {PII / payments / audit / regulatory / none}
```

Refuse if any of the three sub-fields is left blank.

---

### `## Constraints from upstream`

**Elicitation prompt:**

> "Anything Intent has decided that the production factory must respect? Patterns to use, patterns to avoid, release-train windows, external deadlines? If none beyond the standing rules, say so."

**Required output shape:**

```markdown
- {constraint 1}
- ...
```

Or, if genuinely no upstream constraints beyond the standing rules:

```markdown
- None additional beyond rules.
```

The literal phrase "none additional beyond rules" is acceptable per `VENDORED-SCHEMA.md` § 'Schema enforcement'.

---

### `## Data reality decisions`

**Elicitation prompt** (per touchpoint identified from Spark's runtime stack + templates' data inventory):

> "For each external data source your demo currently mocks, pick the mode for the real production version:
>
> - **Real** — production-comparable data accessible during build
> - **Real-Stale** — production data via a stale snapshot
> - **Synthetic** — mock / generated data, by design
> - **Fallback-Active** — real configured with documented fallback to synthetic when unavailable
> - **Degraded** — some fields real, others synthetic, by design
>
> Unknown is **not allowed**. If you can't decide, that's an Intent decision — come back when the team has chosen."

For a typical Spark-built `web` demo, the touchpoints are (from slice 4's templates):

- Customer / business data
- Design system (production repo)
- Local persistence (SQLite / file)

For `cli` demos: same minus design system.

For `other` demos: no auto-suggestion; the developer enumerates their own touchpoints.

**Required output shape:**

```markdown
| Touchpoint | Mode | Notes |
|------------|------|-------|
| <touchpoint 1> | <mode> | <one-line note> |
```

**Refuse on `Unknown`.** Schema enforcement explicitly forbids and the schema's refusal template language is the canonical phrasing:

> "This brief contains **Unknown** data reality for touchpoint **\[name\]**. Intent zone must decide which mode each external data dependency operates in before the factory can plan. See `BRIEF-INPUT-SCHEMA.md` § 7."

---

## Synthesised fields (no elicitation; pure derivation)

| Production schema field | How derived |
|--------------------------|--------------|
| Brief id (optional) | If `/elevate-to-brief --brief-id <KEY>` was supplied, use the key (validate `^[A-Z]+-[0-9]+$`). Otherwise: leave blank in the elevated brief. Production-factory `/plan-brief` will synthesise `WORK-N` when it runs. |
| Prior art references (optional) | If Spark's `## Notes` contains URLs or `.claude/plans/` references, extract as a separate `## Prior art references` section. Else omit. |

---

## What this mapping does NOT do

These are explicit non-features. Mapping discipline holds the brief's central correctness invariant.

- Does **NOT** fabricate any of the 5 elicited fields. If the developer can't answer Boundaries, Affected repos, Risk, Constraints, or Data reality — refuse and surface. The schema's refusal templates are the canonical phrasing.
- Does **NOT** absorb partial answers silently. "I don't know exactly" + improvising the rest = invented Intent decisions = brief looks /plan-brief-acceptable but rests on hallucinated content = defeats the killer-feature acceptance criterion AND violates agentic-safety Rule 4.
- Does **NOT** slice the work. The elevated brief is a fresh production brief; the production factory's `/slice` (Phase 2) runs against it from a clean state.
- Does **NOT** modify the original Spark Brief. Only writes a new `elevated-{slug}.md` (or `{brief-id}-{slug}.md` when `--brief-id` was supplied).
- Does **NOT** invoke the production factory. The developer carries the elevated brief file across factory workspaces manually. No shell-out, no cross-factory PR creation, no automatic file copy.
- Does **NOT** expand or contract `VENDORED-SCHEMA.md`. The vendored copy is the source of truth for what fields are required. If the production factory's schema changes, the prototype factory's vendored copy gets a re-vendor commit; this mapping document gets updated in the same change.
