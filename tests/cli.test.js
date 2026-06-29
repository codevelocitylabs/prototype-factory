const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  validateInitName,
  parseArgs,
  plannedInitHereSteps,
  writeGitignoreMerged,
  installFactoryFiles,
  findBrandingTrace,
  copyFileMaybeScrub,
  WL_STRIP_RE,
  BRANDING_RE,
  CANONICAL_REPO_NAME,
  CVL_ORG,
  FACTORY_DIRS,
  FACTORY_FILES,
  PRESERVED_PATHS,
  WORKING_DIRS,
  TOP_LEVEL_DIRS,
} = require("../bin/cli.js");

function tmpdir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// ---------------------------------------------------------------------------
// validateInitName
// ---------------------------------------------------------------------------

test("validateInitName: empty / missing name rejected", () => {
  assert.match(validateInitName(""), /name required/);
  assert.match(validateInitName(undefined), /name required/);
  assert.match(validateInitName(null), /name required/);
});

test("validateInitName: leading dot rejected", () => {
  assert.match(validateInitName(".hidden"), /cannot start with/);
});

test("validateInitName: leading dash rejected", () => {
  assert.match(validateInitName("-flag"), /cannot start with/);
});

test("validateInitName: invalid characters rejected", () => {
  assert.match(validateInitName("with space"), /must match/);
  assert.match(validateInitName("with/slash"), /must match/);
  assert.match(validateInitName("with$dollar"), /must match/);
  assert.match(validateInitName("with@at"), /must match/);
});

test("validateInitName: canonical-repo collision rejected (direct match)", () => {
  assert.match(
    validateInitName("prototype-factory"),
    /collides with the canonical pack repo/
  );
});

test("validateInitName: cvl- prefixed workspace cannot collide with canonical", () => {
  // init prepends `cvl-` to the name, so the stamped workspace
  // (`cvl-<name>`) can never equal the canonical repo `prototype-factory`.
  // Only a direct name match is blocked.
  assert.strictEqual(validateInitName("cvl-demo"), null);
});

test("validateInitName: production factory's canonical does NOT collide here", () => {
  // The prototype factory only blocks its own canonical name. A name like
  // `claude-code-factory` is therefore valid here. That's fine — distinct packs.
  assert.strictEqual(validateInitName("claude-code-factory"), null);
});

test("validateInitName: valid names accepted", () => {
  assert.strictEqual(validateInitName("my-demo-idea"), null);
  assert.strictEqual(validateInitName("hackathon2026"), null);
  assert.strictEqual(validateInitName("ALL_CAPS"), null);
  assert.strictEqual(validateInitName("with.dots"), null);
  assert.strictEqual(validateInitName("a"), null); // single-char is valid
});

// ---------------------------------------------------------------------------
// parseArgs — dispatch surface (init / --here / --white-label / force-stamp)
// ---------------------------------------------------------------------------

const argv = (...a) => ["node", "cli.js", ...a];

test("parseArgs: init <name> — defaults", () => {
  assert.deepEqual(parseArgs(argv("init", "my-demo")), {
    command: "init",
    name: "my-demo",
    here: false,
    whiteLabel: false,
    dryRun: false,
  });
});

test("parseArgs: init --here stamps in place (no name)", () => {
  const o = parseArgs(argv("init", "--here"));
  assert.strictEqual(o.command, "init");
  assert.strictEqual(o.here, true);
  assert.strictEqual(o.name, undefined);
});

test("parseArgs: init . is sugar for --here", () => {
  const o = parseArgs(argv("init", "."));
  assert.strictEqual(o.here, true);
  assert.strictEqual(o.name, undefined);
});

test("parseArgs: --white-label and --no-branding both set whiteLabel", () => {
  assert.strictEqual(parseArgs(argv("init", "x", "--white-label")).whiteLabel, true);
  assert.strictEqual(parseArgs(argv("init", "x", "--no-branding")).whiteLabel, true);
});

test("parseArgs: white-label is recognised on the force-stamp path", () => {
  assert.deepEqual(parseArgs(argv("--white-label")), {
    command: "force-stamp",
    force: false,
    whiteLabel: true,
  });
});

test("parseArgs: --force and --dry-run recognised", () => {
  assert.strictEqual(parseArgs(argv("--force")).force, true);
  assert.strictEqual(parseArgs(argv("init", "x", "--dry-run")).dryRun, true);
});

// ---------------------------------------------------------------------------
// Branding regexes
// ---------------------------------------------------------------------------

test("BRANDING_RE matches every Code Velocity form", () => {
  for (const s of [
    "Code Velocity",
    "codevelocity",
    "codevelocitylabs",
    "codevelocity.io",
    "cvl-demo",
    "cvl_demo",
    "the CVL way",
  ]) {
    assert.ok(BRANDING_RE.test(s), `should match: ${s}`);
  }
});

test("BRANDING_RE does not match innocent text", () => {
  for (const s of ["prototype factory", "frontend-design", "civil engineer", "the demo"]) {
    assert.ok(!BRANDING_RE.test(s), `should NOT match: ${s}`);
  }
});

test("WL_STRIP_RE removes a marked region, leaving surrounding text", () => {
  const src =
    "keep.<!-- WL-STRIP-START --> drop codevelocity.io here<!-- WL-STRIP-END --> tail";
  assert.strictEqual(src.replace(WL_STRIP_RE, ""), "keep. tail");
});

// ---------------------------------------------------------------------------
// copyFileMaybeScrub
// ---------------------------------------------------------------------------

test("copyFileMaybeScrub: white-label strips markers; plain copy is byte-identical", () => {
  const d = tmpdir("wl-scrub-");
  const src = path.join(d, "src.md");
  const content =
    "alpha.<!-- WL-STRIP-START --> Code Velocity bit.<!-- WL-STRIP-END --> omega\n";
  fs.writeFileSync(src, content);

  const scrubbed = path.join(d, "scrubbed.md");
  copyFileMaybeScrub(src, scrubbed, { whiteLabel: true });
  const out = fs.readFileSync(scrubbed, "utf8");
  assert.strictEqual(out, "alpha. omega\n");
  assert.ok(!BRANDING_RE.test(out));

  const plain = path.join(d, "plain.md");
  copyFileMaybeScrub(src, plain, {});
  assert.strictEqual(fs.readFileSync(plain, "utf8"), content);
});

// ---------------------------------------------------------------------------
// writeGitignoreMerged — merge-safe, idempotent
// ---------------------------------------------------------------------------

test("writeGitignoreMerged: absent → writes the full ignore", () => {
  const d = tmpdir("wl-gi-");
  const r = writeGitignoreMerged(d);
  assert.strictEqual(r.created, true);
  const gi = fs.readFileSync(path.join(d, ".gitignore"), "utf8");
  assert.ok(gi.includes(".env"));
  assert.ok(gi.includes("node_modules/"));
});

test("writeGitignoreMerged: present → merges without clobber, idempotent", () => {
  const d = tmpdir("wl-gi2-");
  fs.writeFileSync(path.join(d, ".gitignore"), "node_modules/\ncustom-thing/\n");

  const r1 = writeGitignoreMerged(d);
  assert.strictEqual(r1.created, false);
  assert.ok(r1.appended > 0);

  const gi = fs.readFileSync(path.join(d, ".gitignore"), "utf8");
  assert.ok(/^custom-thing\/$/m.test(gi), "user's own line preserved");
  assert.ok(/^\.env$/m.test(gi), "pack pattern appended");
  assert.strictEqual(
    (gi.match(/^node_modules\/$/gm) || []).length,
    1,
    "shared pattern not duplicated"
  );

  // Second run appends nothing — the merge is idempotent.
  assert.strictEqual(writeGitignoreMerged(d).appended, 0);
});

// ---------------------------------------------------------------------------
// findBrandingTrace — the white-label gate's detector
// ---------------------------------------------------------------------------

test("findBrandingTrace: seeded CVL string is detected with file:line", () => {
  const d = tmpdir("wl-trace-");
  fs.mkdirSync(path.join(d, ".claude/skills"), { recursive: true });
  fs.writeFileSync(path.join(d, ".claude/skills/foo.md"), "ok\nsee Code Velocity\n");
  const t = findBrandingTrace(d);
  assert.ok(t, "a trace should be found");
  assert.strictEqual(t.file, ".claude/skills/foo.md");
  assert.strictEqual(t.line, 2);
});

test("findBrandingTrace: a clean tree returns null", () => {
  const d = tmpdir("wl-clean-");
  fs.mkdirSync(path.join(d, ".claude/skills"), { recursive: true });
  fs.writeFileSync(path.join(d, ".claude/skills/foo.md"), "totally clean content\n");
  assert.strictEqual(findBrandingTrace(d), null);
});

test("findBrandingTrace: ignores files outside pack-written scopes", () => {
  // An in-place `--here` install must never flag the user's own files —
  // the gate only scans paths the pack itself wrote.
  const d = tmpdir("wl-scope-");
  fs.writeFileSync(path.join(d, "README.md"), "My Code Velocity readme\n");
  assert.strictEqual(findBrandingTrace(d), null);
});

// ---------------------------------------------------------------------------
// End-to-end: the "no trace" invariant (keystone)
// ---------------------------------------------------------------------------

test("white-label stamp has ZERO branding; normal stamp legitimately retains it", () => {
  const wl = tmpdir("wl-stamp-");
  installFactoryFiles(wl, { whiteLabel: true });
  assert.strictEqual(
    findBrandingTrace(wl),
    null,
    "a white-label stamp must contain no Code Velocity trace"
  );
  assert.ok(
    !fs.existsSync(path.join(wl, "docs")),
    "docs/ is omitted under white-label"
  );

  const normal = tmpdir("normal-stamp-");
  installFactoryFiles(normal, {});
  assert.ok(
    findBrandingTrace(normal),
    "the normal stamp legitimately retains the leadgen CTA branding"
  );
});

// ---------------------------------------------------------------------------
// plannedInitHereSteps
// ---------------------------------------------------------------------------

test("plannedInitHereSteps: in-place, no git, white-label omits docs", () => {
  const normal = plannedInitHereSteps(false).join("\n");
  assert.match(normal, /CURRENT directory/);
  assert.match(normal, /not run.*git init/i);
  assert.match(normal, /docs/);

  const wl = plannedInitHereSteps(true).join("\n");
  assert.doesNotMatch(wl, /docs/, "docs/ omitted under white-label");
  assert.match(wl, /white-label gate/);
});

// ---------------------------------------------------------------------------
// Exported constants
// ---------------------------------------------------------------------------

test("exported constants match expected shape", () => {
  assert.strictEqual(CVL_ORG, "codevelocitylabs");
  assert.strictEqual(CANONICAL_REPO_NAME, "prototype-factory");
  assert.ok(Array.isArray(FACTORY_DIRS) && FACTORY_DIRS.length >= 5);
  assert.ok(FACTORY_DIRS.every((d) => d.startsWith(".claude/")));
  assert.ok(Array.isArray(FACTORY_FILES) && FACTORY_FILES.length >= 4);
  assert.ok(Array.isArray(PRESERVED_PATHS) && PRESERVED_PATHS.includes("CLAUDE.md"));
  assert.ok(Array.isArray(WORKING_DIRS) && WORKING_DIRS.length >= 3);
  assert.ok(Array.isArray(TOP_LEVEL_DIRS) && TOP_LEVEL_DIRS.includes("templates"));
});
