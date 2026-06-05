#!/usr/bin/env bash
# Capture Session Start — SessionStart hook.
#
# Writes the session start timestamp and Claude-provided session_id to a
# small state file. The SessionEnd hook reads this to compute accurate
# session duration and to scope "this session's" activity (rather than
# falling back to a 24-hour find heuristic).
#
# The state file is overwritten on each SessionStart — only the most
# recent session is tracked. SessionEnd deletes it after consuming.
#
# Input:  Claude Code SessionStart JSON on stdin (may include session_id, source).
# Output: writes state file; exit always 0.
#
# Fails open on any internal error.
set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
METRICS_DIR="${REPO_ROOT}/.claude/metrics"
STATE_FILE="${METRICS_DIR}/.session-start.json"
mkdir -p "$METRICS_DIR"

command -v jq >/dev/null 2>&1 || exit 0

INPUT="$(cat 2>/dev/null || echo '{}')"
NOW_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NOW_EPOCH=$(date -u +%s)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null || echo "")
SOURCE=$(echo "$INPUT" | jq -r '.source // empty' 2>/dev/null || echo "")

jq -nc \
  --arg session_id "$SESSION_ID" \
  --arg source "$SOURCE" \
  --arg started_at "$NOW_TS" \
  --argjson started_epoch "$NOW_EPOCH" \
  '{
    session_id: (if $session_id == "" then null else $session_id end),
    source: (if $source == "" then null else $source end),
    started_at: $started_at,
    started_epoch: $started_epoch
  }' > "$STATE_FILE" 2>/dev/null || true

exit 0
