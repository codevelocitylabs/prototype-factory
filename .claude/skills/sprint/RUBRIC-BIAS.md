# Rubric Bias — sub-procedure for `/sprint`

**Format version:** 1
**Owner:** `/sprint` (this file is a sibling spec consumed by sprint's SKILL.md)
**Scope pin:** v0.1 = visibility-only bias. v0.2 = decision-altering bias (explicitly deferred — see § "v0.2 deferred bias" below).

This spec describes how `/sprint` handles the optional `## Rubric` field in a Spark Brief. It is invoked by sprint's SKILL.md at two points: Step 3 (Plan Mode lite preview) and Step 8 (Hand off). When the brief's `## Rubric` content is `(none)`, this entire sub-procedure is a **no-op** — sprint runs exactly as it did pre-slice-5.

---

## When to fire

Sprint reads the brief's `## Rubric` section after parsing the brief (its Step 2). Two paths:

- **Rubric is `(none)`** (the literal string the developer left when `/spark` step 4 was skipped or answered "none") → **no-op**. Skip every step below. Sprint preview, customisation, boot, exercise, and hand-off all run unmodified.
- **Rubric is non-`(none)`** (any other content — paste-in markdown, bulleted list, weighted percentages) → proceed to "Parse algorithm" below.

The `(none)` no-op path is **first-class**, not an afterthought. Sprint flows without a rubric must produce byte-identical preview and hand-off output as they did before slice 5. Any regression there is a slice-5 failure.

---

## Parse algorithm

Try each pattern in order. First match wins. If none match, treat the entire rubric block as a single criterion named `"rubric"` with no extracted sub-dimensions.

### Pattern A: Headed sections

Rubric uses `## ` (level-2) headings for each dimension:

```markdown
## Demo quality
Does it actually work end-to-end?

## Visual fit
Does it look like it belongs in the audience's world?

## Business value
Would a real team want this on Monday?
```

Extract each heading as a dimension label. Body content (if any) is captured as the dimension's description but not used for matching.

### Pattern B: Bulleted / numbered list items

Rubric uses `- ` bullets or `1. ` numbered list:

```markdown
- Demo quality — does it actually work?
- Visual fit — does it look like it belongs in the audience's world?
- Business value — Monday-relevance test
```

Extract the **leading clause** of each bullet (text before the first ` — `, ` - `, or `:`) as the dimension label. Trailing description is captured but not used for matching.

### Pattern C: Percentage-weighted lines

Rubric uses inline percentages:

```markdown
Demo quality (40%) — does it actually work?
Visual fit (30%) — does it look like it belongs in the audience's world?
Business value (30%) — Monday-relevance test
```

Extract the **leading clause** before the `(` percentage marker as the dimension label. Capture the percentage as the dimension's weight. **v0.1 captures the weight but does not act on it** (decision-altering bias is v0.2).

### Pattern fallback

If none of A/B/C match (rubric is free-form prose), produce a single-dimension parse result:

```
{ "dimensions": [{ "label": "rubric", "description": "<entire-rubric-text>", "weight": null }] }
```

The coverage map then maps every acceptance criterion to this single dimension (which is uninformative but honest — sprint surfaces the rubric content verbatim in preview / hand-off without pretending to have parsed structure).

---

## Coverage mapping

For each of the brief's `## Acceptance criteria` bullets:

1. Lowercase both the criterion text and each rubric-dimension label.
2. For each dimension label, check if any of its tokens (whitespace-split, length ≥ 4 to filter stop-words like "the", "and") appear as a substring of the criterion text.
3. A criterion may align with zero, one, or multiple dimensions. Record all matches.

The output is a mapping:

```
{
  "criterion 1 text": ["Demo quality", "Business value"],
  "criterion 2 text": ["Visual fit"],
  "criterion 3 text": []
}
```

**v0.1 is keyword-overlap, not semantic.** It will miss synonyms, miss conceptual matches with no word overlap, and may produce false positives. Acceptable for v0.1 visibility; v0.2 may upgrade to embedding-similarity or model-based mapping.

---

## v0.1 surface (the only behaviour change in this slice)

Sprint emits a "Rubric coverage" block at two points:

### In Step 3 (Plan Mode lite preview)

After the existing 4–8 line preview, if the rubric is non-`(none)`, append:

```
Rubric coverage:
  Dimensions extracted: Demo quality, Visual fit, Business value
  Acceptance criterion 1 ("staff can drag a card …") → Demo quality, Business value
  Acceptance criterion 2 ("summary in <5s") → Demo quality
  Acceptance criterion 3 ("account owner named by role") → Visual fit, Business value
```

If any criterion maps to zero dimensions, list it with `→ no rubric match` so the developer can decide whether to revise the rubric or the criterion.

### In Step 8 (Hand off)

After the per-criterion pass/fail summary, if the rubric is non-`(none)`, append:

```
Rubric coverage at hand-off:
  Demo quality: 2/2 criteria addressed (pass)
  Visual fit: 1/1 criteria addressed (pass)
  Business value: 2/2 criteria addressed (pass — but one is "partial" per below)
  
  Criteria with no rubric match: 0
```

Per-dimension state is computed by intersecting the dimension's mapped criteria with the criteria's pass/fail state from sprint's exercise step.

---

## v0.2 deferred bias (explicit non-goals for v0.1)

These behaviours are **NOT** part of v0.1 rubric-bias-logic. If during build you find yourself tempted to write any of them, stop — they belong to v0.2:

1. **Decision-altering ordering.** Auto-prioritising which acceptance criterion sprint satisfies first based on rubric weight. v0.1 keeps the brief's criterion order.
2. **Scaffold emphasis.** Choosing which scaffolded component to lean into (e.g. design-system styling vs visit-counter) based on which rubric dimension is highest-weighted. v0.1 scaffolds identically regardless of rubric.
3. **Auto-scoring.** Sprint computes a numeric demo-vs-rubric score (e.g. "this demo scores 7.5/10 on the rubric"). v0.1 reports per-dimension pass/fail counts only — no aggregated number.
4. **Cross-rubric normalising.** When two demos with different rubrics need their scores compared. v0.1 has nothing to compare against; deferred until cross-demo workflow exists.
5. **Rubric-driven re-customisation.** Sprint re-enters Step 5 (customisation) automatically to satisfy unaddressed rubric dimensions. v0.1 leaves that decision to the developer.

v0.2 promotion of any of these requires a new slice plan, fresh confidence assessment, and explicit format-version bump on this RUBRIC-BIAS.md spec.

---

## Refusal behaviours

This sub-procedure adds **no new refusals** to sprint. Specifically:

- Malformed rubric → fallback Pattern (single-dimension parse), do not refuse.
- Empty acceptance criteria list → already a sprint refusal (slice 3); rubric bias does not change that.
- Rubric content longer than expected → no length cap; sprint surfaces all of it.

If the parse algorithm fundamentally fails (e.g. the rubric file is binary, contains unparseable characters that crash the matcher), sprint should surface the failure honestly (Rule 4) and treat the rubric as `(none)` for that invocation — emit a note in the preview saying "rubric parse failed; treating as no-rubric for this run". This is the only place where a runtime fallback is acceptable; it's bounded by an explicit user-visible surface.

---

## Integration contract with sprint's SKILL.md

This spec is invoked by two conditional blocks in sprint's SKILL.md:

- **Step 3 conditional:** if rubric is non-`(none)`, run Parse algorithm + Coverage mapping + Step-3 surface block.
- **Step 8 conditional:** re-use the Coverage mapping from Step 3 (do not re-parse); combine with the exercise step's pass/fail results; emit Step-8 surface block.

Sprint's SKILL.md MUST cite this file by relative path (`./RUBRIC-BIAS.md`) at both conditional points so the linkage is grep-able.

---

## Common failure modes during build

- **Drifting into decision-altering bias.** "Just one small thing where sprint reorders acceptance criteria…" — that's v0.2. Stop.
- **Breaking the `(none)` no-op path.** Every conditional block must default to no-op when rubric is `(none)`. Verify by mentally running sprint on a brief with `## Rubric` set to `(none)` — output should be identical to slice-3 sprint.
- **Adding new refusals.** Sprint's refusal table stays the same. This spec adds zero refusal cases.
- **Coupling Coverage mapping to specific rubric vocabulary.** The mapping is generic word-overlap; it should work on any rubric (judging criteria for a hackathon, exec priorities for a stakeholder demo, whatever). If you find yourself special-casing "Demo quality" or any other specific phrase, you've coupled too tightly.
