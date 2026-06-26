# Sample walkthrough — `/spark → /sprint → /elevate-to-brief`

Annotated end-to-end transcript for a realistic hackathon idea. Time budget: <60 minutes (aspirational median).

**The idea** (this is the developer's mental starting point — not yet typed anywhere):

> "Auto-summarise customer-success call transcripts into action items. Demo for the head of CS by 4pm. Sample calls only — synthetic data."

The developer just ran `npx @codevelocitylabs/prototype-factory init customer-call-summariser`, `cd`'d into the stamped workspace, and started Claude Code. The clock is running.

---

## Step 1: `/spark` (~3 minutes)

```
Developer> /spark
```

> Spark: "Describe the demo you want to build. Who's it for, and what's the moment they react to?"

```
Developer> Head of customer success needs to see auto-summarised call transcripts.
           I want to show three sample calls, click each, get a 3-5 bullet summary
           with action items. Goal: pitch this for v2 of our CS tooling.
```

> Spark: "Got it — head of CS sees three sample call transcripts, clicks one, gets a 3–5 bullet action-item summary. Demo for v2 CS tooling pitch.
>
> If we shipped exactly this and nothing else, what would your head of CS actually *do* with it in front of you?"

```
Developer> They'd click through all three calls, see the summaries, ask if at least
           one names a specific account owner by role. That's the test.
```

> Spark: "Converting to observable criteria:
> - Three sample call transcripts bundled with the demo; pre-loaded, no upload required.
> - Each transcript renders a 3–5 bullet action-item summary in under 5 seconds of click.
> - At least one summary names an account owner by role (e.g. 'Account exec to follow up on contract renewal').
>
> Look right?"

```
Developer> Yes
```

> Spark: "Default stack is web (single-page HTML + tiny Node server; visuals designed per-demo). Want that, or override to `cli` / `other`?"

```
Developer> web
```

> Spark: "Any visual direction — whose look-and-feel should this echo? The audience's world, a brand, a reference site? (skip if none)"

```
Developer> Clean, modern SaaS dashboard feel — think Linear or Notion. The head of CS lives in tools like that.
```

> Spark: "Hackathon judging rubric or business-stakeholder priority list to bias against? Paste it, give me a file path, or say 'none'."

```
Developer> ## Judging criteria
           1. Demo quality (40%) — does it actually work end-to-end?
           2. Visual fit (30%) — does it look like it belongs in the head of CS's world?
           3. Business value (30%) — Monday-relevance test
```

> Spark: "Captured. Anything else worth flagging — references, prior art, what NOT to build?"

```
Developer> Drift's CTO loved this concept at Q1 strategy day — worth mentioning in pitch.
           Do NOT include real call ingestion; synthetic transcripts only for this demo.
```

> Spark: "Brief written to `.claude/briefs/customer-call-summariser.md`. Run `/sprint` to start building."

The brief file now exists with all six fields populated. **Elapsed: ~3 minutes.**

---

## Step 2: `/sprint` (~25 minutes)

```
Developer> /sprint
```

> Sprint: "Using brief: `.claude/briefs/customer-call-summariser.md`.
>
> Here's the plan:
> - Stack: web (single-page HTML + tiny Node server; visuals designed per-demo via /frontend-design)
> - Scaffold source: `templates/web/` — copying wholesale into workspace root
> - User code lives at `src/demo/` (plus front-end extensions to `public/app.js` and any new routes in `server.js`)
> - Acceptance criteria → expected behaviour:
>   - Three transcripts bundled → load from `src/data/synthetic/transcripts.json` via `server.js`'s `/api/bootstrap`
>   - <5s summary render → client-side rendering of pre-computed summaries (synthetic-data path, no live MCP call)
>   - Account owner by role → render `accountOwner.role` field from synthetic data
> - `--no-boot` not active; will run `node server.js` after customisation (no `npm install` needed — zero deps).
>
> Rubric coverage:
>   Dimensions: Demo quality, Visual fit, Business value
>   Criterion 1 (3 transcripts bundled) → Demo quality
>   Criterion 2 (<5s summary) → Demo quality, Business value
>   Criterion 3 (account owner by role) → Visual fit, Business value
>
> OK to proceed? (y/n)"

```
Developer> y
```

Sprint copies `templates/web/` into the workspace root. Customises:
- Invokes `/frontend-design` and builds a clean SaaS-dashboard UI (per the brief's `## Visual direction`) in bespoke `public/index.html` + CSS — with a discreet "Built with Code Velocity" link + CTA to codevelocity.io.
- Authors `src/demo/transcripts.js` — server-side helper that loads three transcripts from synthetic data.
- Extends `server.js` with `/api/transcripts` and `/api/transcripts/:id/summary` routes (the summary is pre-computed in the synthetic data, no live LLM call this iteration).
- Extends `public/app.js` — adds a list view, a click handler, and a detail view that renders the 3–5 bullet action items + named account owner.
- Replaces `src/data/synthetic/items.json` placeholder content with three call-transcript records the team manually mocked for the demo.

No `npm install` needed — `templates/web/` ships zero dependencies. `node server.js` boots in under a second on `localhost:5173`. Sprint exercises each acceptance criterion via WebFetch:

> Sprint: "Demo running at http://localhost:5173.
> Acceptance criteria: 3/3 passing.
>   ✓ Three sample transcripts bundled, pre-loaded, no upload (verified via WebFetch on `/`).
>   ✓ Summary renders in <5s (synthetic path, client-side — verified via WebFetch on `/api/transcripts/call-001/summary`).
>   ✓ Account owner named by role ("Sarah Chen — account exec") — verified in fixture data.
>
> Next:
>   - Iterate: re-run /sprint to keep customising
>   - Promote: run /elevate-to-brief to produce a production-factory brief
>   - Stop: ctrl-c the dev server when you're done
>
> (web) Code Velocity CTA: present.
>
> Note: the UI was designed per-demo via `/frontend-design` from the brief's `## Visual direction` — bespoke `public/index.html` + CSS, no placeholder stylesheet."

**Elapsed total: ~28 minutes.** Demo runs. The developer screenshares to the head of CS, who clicks through all three calls. The "is this useful?" reaction is positive enough that the demo is worth keeping.

---

## Step 3: `/elevate-to-brief` (~12 minutes)

```
Developer> /elevate-to-brief
```

> Elevate: "Elevating brief: `.claude/briefs/customer-call-summariser.md`.
>
> Schema-drift checkpoint: SHA matches recorded. Vendored schema v1 intact.
> Spark Format version: 1. Parsed.
> Direct mappings applied (Outcome, Acceptance criteria → Success criteria, Notes + Rubric → Crew refinement notes).
>
> Do you have a Jira key for the production version of this work — e.g. `PROJ-123` — or should I leave it blank for the production factory to synthesise `WORK-N`?"

```
Developer> no key, let WORK-N synthesise
```

> Elevate (Step 6 — eliciting the 5 missing fields):
>
> "What's adjacent to your demo that you deliberately *aren't* asking the production factory to build? Both directions — what's in scope, what's explicitly out."

```
Developer> In: auto-summarisation endpoint + 3 sample call ingestion + role-named-owner rendering.
           Out: real call ingestion (no recording integration), multi-tenant
           (single-CS-team scope), real auth (assume internal SSO already solved).
```

> Elevate: "When this becomes a production change, which production repos does it touch? Suggestion based on web stack: new MFE repo to be created (e.g. `cvl-call-summariser`)."

```
Developer> Yes, new MFE repo. Also touches: backend API for summarisation (existing
           internal AI service — `cvl-ai-services` repo, new endpoint).
```

> Elevate: "Three quick things:
> 1. Blast radius if it goes wrong: one user / many users / regulator-visible?
> 2. Reversibility: instant rollback / DB migration / external service?
> 3. Compliance touch points: PII / payments / audit / regulatory / none?"

```
Developer> Many users (head of CS demos to her team after greenlight),
           instant rollback (no migrations, just feature-flag),
           PII (real customer-call content if we ever ingest real calls; sample-only for v1).
```

> Elevate: "Constraints from upstream — patterns to use, patterns to avoid, deadlines?"

```
Developer> Use the new event bus for summarisation triggers (legal flagged the old queue).
           No specific deadline beyond Q2 OKR support.
```

> Elevate: "Data reality decisions. For each touchpoint, pick a mode (Real / Real-Stale / Synthetic / Fallback-Active / Degraded — Unknown is not allowed):
> - Call transcript source (real call ingestion vs synthetic): ?
> - Customer / business data: ?
> - Design system (production repo): ?
> - Summarisation AI endpoint: ?
> - Local persistence: ?"

```
Developer> Call transcript source: Real for production (real call ingestion to be designed).
           Customer data: Synthetic (PII compliance — never real for this product).
           Design system: Real (production has it).
           Summarisation AI: Real.
           Local persistence: N/A — production is API-backed, no local files.
```

> Elevate: "Schema enforcement walk:
> ✓ Outcome stated (paragraph from spark)
> ✓ Success criteria — 3 observable
> ✓ Boundaries — 3 in, 3 out
> ✓ Affected product repos — 2 named
> ✓ Risk + reversibility + compliance noted
> ✓ Constraints — 2 named (event bus, OKR window)
> ✓ Data reality decisions — 5 touchpoints, no Unknown
>
> Elevated brief written to `.claude/briefs/elevated-customer-call-summariser.md`.
> Handoff package written to `.claude/briefs/elevated-customer-call-summariser.zip`.
>
> To hand off to the production factory:
> 1. Download `.claude/briefs/elevated-customer-call-summariser.zip` from this workspace.
> 2. Extract it into the production-factory workspace's .claude/briefs/.
> 3. Run `/plan-brief .claude/briefs/elevated-customer-call-summariser.md`.
> 4. /plan-brief should accept on first attempt."

**Elapsed total: ~40 minutes.** Well under the 60-minute aspirational median.

---

## What just happened

In ~40 minutes the developer:

1. Captured a demo idea (5 fields).
2. Built a working local demo (with one documented v0.1 workaround for the DS placeholder).
3. Showed the demo to a stakeholder and got a green light.
4. Produced a production-factory-ready brief with all 7 required fields populated honestly — no fabrication, no `Unknown`, no smooth-overs.

The production factory takes over from here. The prototype factory's chain ends at step 3's hand-off. The demo workspace stays local (or gets pushed if the developer wants durable history of *this specific demo*); the elevated brief is the artifact that crosses to the production factory.

**The killer feature is the bridge.** Without `/elevate-to-brief`, step 3 would be "rebuild this demo from scratch in the production factory, hope nothing important got lost in translation". With it, what's already understood transfers cleanly.
