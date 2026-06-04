// Visit counter — domain wrapper over the generic JSON persistence helpers.
// Same pattern as cli's run-counter.js: hides storage mechanism + key
// from callers, kills magic strings at use sites.

import { readJsonState, writeJsonState } from './persistence.js';

const VISIT_COUNTER_KEY = 'visits';

export function incrementAndGetVisits() {
  const previous = readJsonState(VISIT_COUNTER_KEY, 0);
  const next = previous + 1;
  writeJsonState(VISIT_COUNTER_KEY, next);
  return next;
}
