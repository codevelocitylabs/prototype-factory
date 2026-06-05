# Metrics — Prototype Factory

The prototype factory emits a deliberately small set of metrics. Everything optional in the production factory (confidence gate, architecture review, swarm reconciliation, data touchpoint coverage) is stripped here.

## v0.1 scope — what's actually emitted

| File | Emitted by | Purpose |
|------|-----------|---------|
| `.session-start.json` | SessionStart hook (`capture-session-start.sh`) | Single-record state file — start timestamp + session_id. Overwritten each SessionStart, consumed and deleted by SessionEnd. Gitignored. |
| `session-end.jsonl` | SessionEnd hook (`capture-session-end-payload.sh`) | One JSONL line per session — duration + activity scope. Append-only. Gitignored. |

That's the entire v0.1 metric surface. Skills (`/spark`, `/sprint`, `/elevate-to-brief`) **do not** emit per-brief, per-slice, per-task-group metrics. The pack is for speed-to-demo; metrics audit is a production-factory concern.

## What is NOT emitted (and why)

| Production factory metric | Why stripped |
|----------------------------|--------------|
| `phase-state.json` | No phase chain to track. Spark → sprint → demo is straight-line; chain state lives in conversation. |
| `confidence.json` | No confidence gate. The whole point is to skip the gate and ship fast. |
| `execution-outcome-{slice}.json` | No slices. The demo is the slice. |
| `code-review-{slice}.json` | No formal code review. |
| `data-touchpoint.json` | Touchpoints are decided at scaffold time (slice 4's responsibility in the build) — runtime tracking would be ceremony. |
| `swarm.json`, hardening artefacts | No hardening swarm. |
| `learning.jsonl` | No structured learning capture. Demos that prove out elevate to the production factory, which has its own learning surface. |

## v0.2+ — possible expansions

- **`elevate.jsonl`** — one line per `/elevate-to-brief` invocation, recording: which spark brief was elevated, schema-drift checkpoint result, whether `/plan-brief` accepted the output on first attempt. This is the natural place to track the cross-factory contract health, but it lands when slice 6 (`elevate-to-brief`) ships, not in v0.1.
- **`spark-rubric.jsonl`** — when a rubric is supplied to `/spark`, capture which rubric and what bias was applied. Useful for "did the rubric mode actually help?" calibration. Lands with slice 5 (`rubric-bias-logic`).

Anything more elaborate belongs in the production factory, not here.
