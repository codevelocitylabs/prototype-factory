#!/usr/bin/env bash
# Test runner for the prototype factory pack.
# Mirrors the production factory's scripts.test invocation.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Running node --test on test files..."
# Pass each *.test.js explicitly. Node's directory-mode discovery on Windows + Node 24
# trips over non-JS sibling files (e.g. this shell script). Explicit globbing is portable.
shopt -s nullglob
TEST_FILES=(tests/*.test.js)
if [ ${#TEST_FILES[@]} -eq 0 ]; then
  echo "No test files found." >&2
  exit 1
fi
node --test "${TEST_FILES[@]}"

echo ""
echo "All tests passed."
