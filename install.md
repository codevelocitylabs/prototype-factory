# Install — Code Velocity Labs Prototype Factory

Two install paths. Both are non-destructive.

---

## Quick start (three commands)

```bash
npx @codevelocitylabs/prototype-factory init my-demo-idea
cd cvl-my-demo-idea
claude
```

Then inside Claude Code: `/spark` to start, `/sprint` to build, `/elevate-to-brief` to promote.

---

## Path 1: Spawn a workspace (typical hackathon use)

```bash
npx @codevelocitylabs/prototype-factory init my-demo-idea
```

What happens:

1. Validates the name (matches `[A-Za-z0-9._-]+`, no leading dot/dash, no collision with the canonical pack repo name).
2. Creates a local sibling directory `./cvl-my-demo-idea/`.
3. Stamps the v0.1 pack into it (skills, rules, settings, templates, hooks, docs).
4. Runs `git init -b main` + initial commit.
5. **Does NOT push to GitHub.** Does NOT call `gh repo create`. Does NOT apply branch protection.

The deferred-push design is deliberate: hackathon iteration shouldn't be coupled to durable persistence. When you decide the demo is worth keeping for real, push manually:

```bash
cd cvl-my-demo-idea
gh repo create codevelocitylabs/cvl-my-demo-idea --private --source . --push
gh api -X PUT repos/codevelocitylabs/cvl-my-demo-idea/branches/main/protection --input - <<< '{"required_status_checks":null,"enforce_admins":false,"required_pull_request_reviews":{"required_approving_review_count":1,"dismiss_stale_reviews":true},"restrictions":null}'
```

Or hand the demo off to the production factory via `/elevate-to-brief` and let the production factory's `/plan-brief → /slice → /build → /harden → /ship` chain take over from there.

---

## Path 2: Force-stamp into an existing directory

```bash
cd my-existing-thing
npx @codevelocitylabs/prototype-factory --force
```

What happens:

- Factory dirs (`.claude/agents/`, `.claude/commands/`, `.claude/rules/`, `.claude/skills/`, `.claude/hooks/`) and the templates directory are overwritten with the latest pack version.
- Factory files (`.claude/settings.json`, `.claude/metrics/SCHEMA.md`, etc.) are overwritten.
- **Preserved paths** survive untouched: `.claude/plans/`, `.claude/metrics/`, `.claude/briefs/`, `CLAUDE.md`.
- `.claude/.factory-version` updates to the version you just stamped.

Useful when: upgrading a stamped workspace to a newer pack version, or applying the pack to a directory you initialised by hand.

---

## Prerequisites

| Tool | Version | Required for |
|------|---------|---------------|
| Node | 22+ | The pack's CLI uses `node:test` + `node:fs`. Older Node versions are rejected. |
| Git | 2.40+ | Local `git init` step in `init`; force-stamp doesn't touch git state. |
| Claude Code CLI | current | The pack's three skills are invoked as Claude slash-commands. |
| `gh` CLI authed | optional | Only for the deferred-push step (after `init`). Not required for `init` itself or for `--force`. |
| `npm login --registry=https://npm.pkg.github.com` | optional | Only for publishing pack updates upstream. Not needed to use the pack. |

---

## Verifying the install

After `init` or `--force`:

```bash
cat .claude/.factory-version          # should match the version you installed
ls .claude/rules/                     # should include agentic-safety.md, persona.md
jq '.outputStyle' .claude/settings.json     # should output "Explanatory"
ls .claude/skills/                    # should include spark, sprint, elevate-to-brief
ls templates/                         # should include web, cli
```

If any of these fail, see Troubleshooting below.

---

## Troubleshooting

**`node bin/cli.js` says "Node 22+ required":** install Node 22+ via nvm / asdf / volta / your package manager. The version cap is enforced because the pack's CLI uses Node 22 stable features.

**`templates/web/` and `npm install`:** the web template ships zero dependencies and needs no `npm install` — it boots with `node server.js`. Visuals are generated per-demo by `/frontend-design`, so there is no design-system package to resolve.

**`gh repo create` fails with permission error:** verify `gh auth status` shows authenticated user with `repo` scope in `codevelocitylabs`. The deferred-push step assumes this; the `init` step itself does not.

**Claude Code doesn't see `/spark` as a slash command:** verify `.claude/skills/spark/SKILL.md` exists. Skills are auto-registered on session start.

**MCP servers don't connect:** the v0.1 pack ships with no MCP servers registered by default. If your demo needs MCP integration, register the relevant servers in `.claude/settings.json`'s `mcpServers` block (or per-developer via `.claude/settings.local.json`).

---

## FAQ

**Q: Why doesn't `init` push to GitHub by default?**

A: Hackathon iteration is reversible — you may throw away the first three demos. Push couples the demo to durable history; for v0.1's hackathon use case, that's the wrong default. When you decide the demo is worth keeping, run `gh repo create --source . --push` (see Path 1 above). For more, see `docs/capability-model.md`.

**Q: How is this different from the production factory?**

A: That's the production factory — a different pack, different chain, different discipline. The prototype factory is its sibling, optimised for speed. The two share `agentic-safety.md` and `persona.md` but diverge on everything else. The bridge between them is `/elevate-to-brief`. See `docs/capability-model.md` for the side-by-side view.

**Q: Can I install both factories in the same workspace?**

A: Yes — the packs are scoped npm packages with distinct names. They share no file paths beyond the optional `.claude/` skeleton. In practice you probably want each factory in its own workspace, since their CLAUDE.md files describe different operating disciplines.

**Q: When does the chain end?**

A: Locally, at `/sprint`'s hand-off ("Demo running at localhost:5173 — iterate or run `/elevate-to-brief`"). For demos that prove out, `/elevate-to-brief` writes a brief you hand to the production factory; the chain continues there as `/plan-brief → /slice → /build → /harden → /ship`. For demos that don't prove out, ctrl-c the dev server and walk away — the workspace is local-only, nothing to clean up beyond a `rm -rf`.

---

## What this pack does NOT install

- **The production factory.** A separate, private pack; install it separately if you want the full 7-phase chain.
- **Product-specific dependencies.** Shared-data-shapes scaffolds are wired but may require valid npm credentials (and the v0.2 swap) to resolve at install time. Web visuals need no package — `/frontend-design` generates them per-demo.
- **Cloud auth.** Local-only by design.
