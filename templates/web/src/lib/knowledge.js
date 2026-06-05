// knowledge.js — generic loader for hackathon demo data.
// Mirror of templates/cli/src/lib/knowledge.js; cross-stack interface parity.
//
// Hackathon teams provide their own demo data (real or mocked) at
// src/data/synthetic/items.json. Sprint customisation can extend or
// replace this lib to fit a particular demo's shape.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEMS_PATH = join(__dirname, '..', 'data', 'synthetic', 'items.json');

export function listKnowledgeItems() {
  return JSON.parse(readFileSync(ITEMS_PATH, 'utf8'));
}

export function describeKnowledgeSource() {
  return { label: 'src/data/synthetic/items.json' };
}
