// Run counter — domain wrapper over the generic JSON persistence helpers.
// Same pattern as web's visit-counter.ts: hides storage mechanism + key
// from callers, kills magic strings at use sites.

import { readJsonState, writeJsonState } from './persistence.js';

const RUN_COUNTER_KEY = 'runs';

export function incrementAndGetRuns() {
  const previous = readJsonState(RUN_COUNTER_KEY, 0);
  const next = previous + 1;
  writeJsonState(RUN_COUNTER_KEY, next);
  return next;
}
