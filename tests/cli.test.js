const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateInitName,
  CANONICAL_REPO_NAME,
  CVL_ORG,
  FACTORY_DIRS,
  FACTORY_FILES,
  PRESERVED_PATHS,
  WORKING_DIRS,
  TOP_LEVEL_DIRS,
} = require("../bin/cli.js");

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
