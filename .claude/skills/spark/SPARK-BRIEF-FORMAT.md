# Spark Brief Format — the contract `/spark` writes and downstream skills read

**Format version:** 2
**Producer:** `/spark` (this skill)
**Consumers:** `/sprint`, `/elevate-to-brief`, `rubric-bias-logic`

This document is the authoritative spec for what a `/spark`-produced brief looks like on disk. It is **not** the same shape as the production factory's `BRIEF-INPUT-SCHEMA.md` — the Spark Brief Format is deliberately simpler. The gap between the two is bridged by `/elevate-to-brief`, which elicits the missing fields when (and only when) a demo is being promoted to a production brief.

---

## Field set

A Spark Brief contains **six sections**, in this order:

1. `## Outcome`
2. `## Acceptance criteria`
3. `## Runtime stack`
4. `## Visual direction`
5. `## Rubric`
6. `## Notes`

Sections are markdown second-level headings (`## `). No nesting. `## Outcome`, `## Acceptance criteria`, and `## Runtime stack` carry real content; `## Visual direction`, `## Rubric`, and `## Notes` may be the literal `(none)`. Further fields land in a future version via a format-version bump.

Above the sections, the file carries a level-1 heading with the idea title and one metadata line:

```markdown
# {Idea title}

**Prototype factory brief — produced by /spark on {ISO 8601 timestamp}**
**Spark format version:** 2
```

The metadata line lets downstream parsers fail fast on version drift.

---

## Field specifications

### 1. Outcome (required, paragraph)

One or two paragraphs. Names the demo, the audience, and the moment the audience reacts to.

**Validation:** non-empty. No further structural check.

**Example:**
> A hackathon team needs to show the head of customer success a working demo of "auto-summarise this customer call into action items" by 4pm so we can pitch it for v2 of our CS tooling. The demo runs on the dev's laptop; the head of CS clicks through three sample calls and sees actionable summaries.

### 2. Acceptance criteria (required, bulleted list)

At least one bullet. Each bullet is one observable criterion — something a third party watching the demo can check off.

**Validation:** non-empty; each line begins with `- `.

**Example:**
> - Three sample call transcripts are bundled with the demo; pre-loaded, no upload required.
> - Each transcript renders a 3–5 bullet action-item summary in under 5 seconds of click.
> - At least one summary names an account owner by role (e.g. "Account exec to follow up on contract renewal date").

### 3. Runtime stack (required, single value)

One of: `web` (default), `cli`, `other`. If `other`, a free-text description follows on the same line.

**Validation:** matches `^(web|cli|other.*)$` exactly. (`other` is permissive — the developer is on their own for non-default stacks until slice 4 scaffolds catch up.)

**Examples:**
> web
>
> cli
>
> other: macOS menu-bar app

### 4. Visual direction (optional; the *content* may be `(none)`)

A free-text look-and-feel cue for `/sprint`: whose visual world the demo should echo (the audience's domain, a brand, a reference site). Web demos typically fill it; `cli`/`other` and "no opinion" use `(none)`. When `(none)`, `/sprint` infers direction from `## Outcome`'s audience.

**Validation:** non-empty (either a cue or the literal `(none)`).

**Examples:**
> Feel like a boutique third-wave coffee roaster's site — warm, editorial, generous whitespace.
>
> (none)

### 5. Rubric (required field; the *content* may be `(none)`)

If the developer supplied a rubric: paste-in markdown, file content, or `[see rubric.md]` reference. Verbatim — `/spark` does not summarise the rubric.

If no rubric: the literal string `(none)`.

**Validation:** non-empty (either rubric content or the literal `(none)`).

**Examples:**

Rubric supplied:
> ## Judging criteria
> 1. Demo quality (40%) — does it actually work, end-to-end?
> 2. Visual fit (30%) — does it look like it belongs in the audience's world?
> 3. Business value (30%) — would a real CS team want this on Monday?

No rubric:
> (none)

### 6. Notes (required field; the *content* may be `(none)`)

Free-form. Anything the developer wants captured — prior art references, what-not-to-build, links to inspiration, ad-hoc scratchpad.

**Validation:** non-empty (either notes content or the literal `(none)`).

---

## File location and slug

Briefs are written to `.claude/briefs/{slug}.md` where `{slug}` is a kebab-case derivation of the idea title (3–5 words, lowercase, hyphen-separated, no leading/trailing hyphens).

`/spark` does not stamp the brief with an external tracker id (no Jira key, no `WORK-N`). `/elevate-to-brief` adds one when promoting to the production factory.

---

## Versioning

The `**Spark format version:** N` metadata line is the canary. Consumers (`/sprint`, `/elevate-to-brief`, `rubric-bias-logic`) support version **≤ 2** and refuse briefs newer than they understand.

**v2 (current)** added the optional `## Visual direction` section. It is **additive and backward-compatible**: a v1 brief (no `## Visual direction`) stays valid — consumers treat the absent section as `(none)`. No migration of existing briefs is required.

Format extensions are **additive only**:

- A new version may add optional sections — but must NOT remove or rename existing ones.
- A new version may add field values (e.g. `mobile` to runtime stack) — but must NOT remove `web`, `cli`, `other`.
- Removing or renaming a section requires a version bump and a coordinated update across all consumers.

---

## Comparison: Spark Brief Format vs `BRIEF-INPUT-SCHEMA.md`

The production factory's `BRIEF-INPUT-SCHEMA.md` (in `production-factory (private)/.claude/skills/shape-brief/`) requires seven fields. Spark requires six. The gap maps as follows:

| Production `BRIEF-INPUT-SCHEMA.md` field | Spark Brief Format | Bridging behaviour at `/elevate-to-brief` |
|------------------------------------------|---------------------|--------------------------------------------|
| Outcome | `## Outcome` | Direct map. |
| Success criteria | `## Acceptance criteria` | Direct map (slight rename). |
| Boundaries (in / out of scope) | — | **Elicit at elevation time.** Ask the developer "what's adjacent to this that we deliberately didn't build?" |
| Affected product repos | — | **Elicit at elevation time.** Spark doesn't know — the answer depends on which production repos the demo would touch. |
| Risk and reversibility | — | **Elicit at elevation time.** Hackathon demos are low-risk by construction (local-only, mock data); production has different physics. |
| Constraints from upstream | — | **Elicit at elevation time.** Specifically the constraints that *only matter when promoting* — release-train windows, compliance touch points. |
| Data reality decisions | — | **Elicit at elevation time.** Spark's demos default to synthetic customer data + generic placeholder items (slice 4's scaffold); production needs explicit Real / Real-Stale / Synthetic / Fallback / Degraded decisions per touchpoint. |
| (production: optional) Brief id | — | `/elevate-to-brief` either accepts an explicit Jira key from the developer or lets the production factory's `/plan-brief` synthesise `WORK-N`. |
| (production: optional) Crew refinement notes | `## Notes` + `## Rubric` content | Spark's Notes and Rubric flow into Crew refinement notes on elevation. |
| (production: optional) Prior art references | (folded into Notes) | Spark captures these informally in Notes; `/elevate-to-brief` extracts them as a Prior art section if patterns suggest URLs/refs. |

**Plus, fields with no production-side analogue:**

| Spark Brief Format field | Production-side handling |
|---------------------------|---------------------------|
| `## Runtime stack` | Not in production schema (production briefs describe a *change* to existing repos, not a *new* demo stack). `/elevate-to-brief` translates the stack pick into an "Affected product repos" answer (e.g. `web` → "a new MFE repo to be created" or "an existing MFE repo to be extended"). |
| `## Visual direction` | No production-schema field. `/elevate-to-brief` carries it into the elevated brief's refinement notes — it informed the demo's look; it does not gate promotion. |

The asymmetry is intentional. Spark optimises for **speed of capture**; the production schema optimises for **gate-checkable completeness**. The two formats meet at `/elevate-to-brief`, where the developer is asked to fill the gap deliberately.

---

## Reference implementation note (for slice 6's `/elevate-to-brief`)

When `/elevate-to-brief` reads a Spark Brief, the parsing algorithm is:

1. Check `**Spark format version:** N` — refuse if N > 2 (the supported version). A v1 brief is valid: treat a missing `## Visual direction` as `(none)`.
2. Extract the level-1 heading as the idea title.
3. For each section, extract the content between the `## {section}` heading and the next `## ` heading (or EOF).
4. Validate that `## Outcome`, `## Acceptance criteria`, and `## Runtime stack` are non-empty. `## Visual direction`, `## Rubric`, and `## Notes` may be the literal `(none)`.
5. If a required section is missing or empty, refuse and surface — do not improvise.

This algorithm is also what `/sprint` and `rubric-bias-logic` use when consuming a Spark Brief.
