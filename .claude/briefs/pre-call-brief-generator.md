# Pre-call intelligence brief generator

**Prototype factory brief — produced by /spark on 2026-05-18**
**Spark format version:** 1

## Outcome

A demo for a professional services client's HR & Employment Law product stakeholders showing the most direct response to the single highest-signal finding in the client research dataset — *"don't have to repeat myself"* (three unprompted post-its from three independent client groups; the satisfaction driver with the largest gap between importance and delivery).

The user is the advisor. The moment is the ~30 seconds before they pick up the phone to a client. Today, that prep happens mid-call, using case notes that carry inherited interpretation from previous advisors. This demo shows what it looks like when it doesn't: paste raw case input (messy chronological notes, prior advisor write-ups, emails, voicemail transcripts) and a neutral, structured pre-call brief appears in under 5 seconds. The advisor reads it; they walk into the call already knowing the client.

The stakeholder reacts to the *speed* and the *neutrality* — the brief is fact-first, with interpretation isolated as flagged uncertainties. That is the bit a client-side reviewer would point at and say "this addresses the cautious-advice (P3) and note-reading-bias pains in the value proposition canvas at the same time."

## Acceptance criteria

- Paste a messy block of case notes (≥1 page) into the tool; structured brief appears in under 5 seconds.
- Brief contains four named sections: **Client context** · **What's happened** · **Open questions** · **Risk flags**.
- The brief is *neutral* — no inherited interpretation language (e.g. "the client was difficult about…"); just facts plus flagged uncertainties.
- A second advisor reading the same brief lands on the same factual base (addresses Persona-1 P3's note-reading-bias cause from the VPC).
- Total reading time for the brief is ≤30 seconds (fits on one screen, no scroll).

## Runtime stack

other: single `index.html` (textarea + submit button + result pane) served by a tiny Node or Bun server (~30 lines) that holds the Anthropic API key and proxies one Claude API call. No build step, no framework, no router. `node server.js` (or `bun server.js`) boots it. Target shape: two files + `.env`, ~150 LOC total.

## Rubric

(none)

## Notes

- Source context that informed this brief lives outside the repo (a client-confidential product proposition doc and value proposition canvas). The first names the "translation layer" principle (what agents do vs. what advisors do); the second supplies the evidenced client pains the demo targets (P3 cautious advice, P6 "don't repeat myself", and the advisor-side note-reading-bias cause).
- What NOT to build: do **not** refactor `templates/web/` (currently Astro/Vite) during this sprint. The developer raised whether the factory's default web template should be made lighter-weight; the deliberate decision was to ship this demo against the lighter pattern first and promote to the template only if it proves out — separate PR, separate cycle. The prototype factory's first guard rail is "speed is the discipline."
- What NOT to build: do **not** invent judgment for the advisor. The brief surfaces *facts* and *flagged uncertainties*; it does not recommend an action. That carve-out is load-bearing — the proposition doc explicitly reserves judgment for the human layer, and a demo that crosses that line undermines the moat it is supposed to illustrate.
- Demo data: synthetic case notes only. No real client data. The sprint should bundle 2–3 deliberately messy synthetic case histories the stakeholder can click between.
