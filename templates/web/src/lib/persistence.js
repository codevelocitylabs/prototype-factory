// Local persistence — flat JSON under ./.demo-state/.
// Mirror of templates/cli/src/lib/persistence.js; cross-stack interface parity.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STATE_DIR = '.demo-state';

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
  return STATE_DIR;
}

function jsonPath(key) {
  return join(ensureStateDir(), `${key}.json`);
}

export function readJsonState(key, fallback) {
  const path = jsonPath(key);
  if (!existsSync(path)) {
    return fallback;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeJsonState(key, value) {
  writeFileSync(jsonPath(key), JSON.stringify(value, null, 2));
}

export function getStateDir() {
  return STATE_DIR;
}
