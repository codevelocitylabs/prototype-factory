#!/usr/bin/env bash
# Capture Session End Payload — SessionEnd hook.
#
# Pairs with capture-session-start.sh. Reads the .session-start.json state
# file written at SessionStart, computes accurate session duration, and
# scopes "this session's" activity using start time rather than a 24-hour
# find heuristic. Writes one JSONL line to session-end.jsonl, then deletes
# the start-state file.
#
# If no start-state file exists (e.g. session predates the SessionStart
# hook being installed, or the start hook failed), falls back to a 24-hour
# window and marks the entry with `start_known: false`.
#
# Input:  Claude Code SessionEnd JSON on stdin.
# Output: appends to JSONL; exit always 0.
#
# Fails open on any internal error.
set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
METRICS_DIR="${REPO_ROOT}/.claude/metrics"
LOG_FILE="${METRICS_DIR}/session-end.jsonl"
START_STATE="${METRICS_DIR}/.session-start.json"
mkdir -p "$METRICS_DIR"

command -v jq >/dev/null 2>&1 || exit 0

INPUT="$(cat 2>/dev/null || echo '{}')"
NOW_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NOW_EPOCH=$(date -u +%s)

# Read start state (if present).
SESSION_ID=""
STARTED_AT=""
STARTED_EPOCH=0
START_KNOWN=false
if [[ -f "$START_STATE" ]]; then
  SESSION_ID=$(jq -r '.session_id // ""' "$START_STATE" 2>/dev/null || echo "")
  STARTED_AT=$(jq -r '.started_at // ""' "$START_STATE" 2>/dev/null || echo "")
  STARTED_EPOCH=$(jq -r '.started_epoch // 0' "$START_STATE" 2>/dev/null || echo 0)
  if [[ "$STARTED_EPOCH" -gt 0 ]]; then
    START_KNOWN=true
  fi
fi

# Compute duration and the find-window in minutes for this session's scope.
# If start unknown, fall back to 24 hours.
if [[ "$START_KNOWN" == "true" ]]; then
  DURATION_SECONDS=$((NOW_EPOCH - STARTED_EPOCH))
  WINDOW_MINUTES=$(((DURATION_SECONDS / 60) + 1))
else
  DURATION_SECONDS=null
  WINDOW_MINUTES=1440
fi

# Files modified during this session — bounded to the session window.
# v5 layout: per-brief subfolders .claude/metrics/{brief-id}/phase-state.json
# (the v4 flat layout was .claude/metrics/phase-state-{brief-id}.json — kept
# in fallback for older workspaces that haven't migrated yet).
BRIEF_IDS_JSON="[]"
# Per-brief layout: parent directory name IS the brief id.
RECENT_KEYS_NEW=$(find "$METRICS_DIR" -mindepth 2 -maxdepth 2 -name 'phase-state.json' -mmin "-${WINDOW_MINUTES}" 2>/dev/null \
  | sed -E 's|.*/([^/]+)/phase-state\.json$|\1|' \
  | sort -u || true)
# Flat-layout fallback for v4 workspaces.
RECENT_KEYS_OLD=$(find "$METRICS_DIR" -maxdepth 1 -name 'phase-state-*.json' -mmin "-${WINDOW_MINUTES}" 2>/dev/null \
  | sed -E 's|.*/phase-state-(.+)\.json$|\1|' \
  | sort -u || true)
RECENT_KEYS=$(printf '%s\n%s\n' "$RECENT_KEYS_NEW" "$RECENT_KEYS_OLD" | grep -v '^$' | sort -u || true)
if [[ -n "$RECENT_KEYS" ]]; then
  BRIEF_IDS_JSON=$(printf '%s\n' "$RECENT_KEYS" | jq -R . | jq -sc .)
fi

METRICS_WRITTEN=0
# Count any *.json file written during the session under the metrics tree
# (root + per-brief folders), excluding the transient .session-start.json.
METRICS_WRITTEN=$(find "$METRICS_DIR" -type f -name '*.json' -not -name '.session-start.json' -mmin "-${WINDOW_MINUTES}" 2>/dev/null | wc -l | tr -d ' ' || echo 0)

# Lint events that happened during the session: filter the JSONL by timestamp >= STARTED_AT.
LINT_EVENTS=0
LINT_LOG="${METRICS_DIR}/lint-and-log.jsonl"
if [[ -f "$LINT_LOG" ]]; then
  if [[ "$START_KNOWN" == "true" ]]; then
    LINT_EVENTS=$(jq -c --arg since "$STARTED_AT" 'select(.timestamp >= $since)' "$LINT_LOG" 2>/dev/null | wc -l | tr -d ' ' || echo 0)
  else
    TODAY=$(date -u +"%Y-%m-%d")
    LINT_EVENTS=$(grep -c "\"timestamp\":\"${TODAY}T" "$LINT_LOG" 2>/dev/null || echo 0)
  fi
fi

# Phases active in this session.
# Reads both the v5 per-brief layout and the v4 flat-layout fallback.
PHASES_JSON="[]"
{
  find "$METRICS_DIR" -mindepth 2 -maxdepth 2 -name 'phase-state.json' -mmin "-${WINDOW_MINUTES}" 2>/dev/null
  find "$METRICS_DIR" -maxdepth 1 -name 'phase-state-*.json' -mmin "-${WINDOW_MINUTES}" 2>/dev/null
} | while read -r f; do
  [[ -z "$f" || ! -f "$f" ]] && continue
  JK=$(jq -r '.brief_id // ""' "$f" 2>/dev/null || echo "")
  CP=$(jq -r '.current_phase // ""' "$f" 2>/dev/null || echo "")
  [[ -n "$JK" && -n "$CP" ]] && printf '{"brief_id":"%s","phase":%s}\n' "$JK" "$CP"
done > /tmp/.factory-phases.$$ 2>/dev/null || true
PHASE_ENTRIES=$(cat /tmp/.factory-phases.$$ 2>/dev/null || echo "")
rm -f /tmp/.factory-phases.$$ 2>/dev/null || true
if [[ -n "$PHASE_ENTRIES" ]]; then
  PHASES_JSON=$(echo "$PHASE_ENTRIES" | jq -sc .)
fi

# Use --argjson for nullable fields so jq emits the whole object.
jq -nc \
  --arg event "session_end" \
  --arg session_id "$SESSION_ID" \
  --argjson start_known "$START_KNOWN" \
  --arg session_started "$STARTED_AT" \
  --arg session_ended "$NOW_TS" \
  --argjson duration_seconds "${DURATION_SECONDS}" \
  --argjson brief_ids_touched "$BRIEF_IDS_JSON" \
  --argjson phases_active "$PHASES_JSON" \
  --argjson metrics_written "$METRICS_WRITTEN" \
  --argjson lint_events "$LINT_EVENTS" \
  '{
    event: $event,
    session_id: (if $session_id == "" then null else $session_id end),
    start_known: $start_known,
    session_started: (if $session_started == "" then null else $session_started end),
    session_ended: $session_ended,
    duration_seconds: $duration_seconds,
    brief_ids_touched: $brief_ids_touched,
    phases_active: $phases_active,
    metrics_written: $metrics_written,
    lint_events: $lint_events
  }' >> "$LOG_FILE" 2>/dev/null || true

# Clean up the start-state file so the next session starts fresh.
rm -f "$START_STATE" 2>/dev/null || true

exit 0
