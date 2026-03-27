#!/usr/bin/env bash
# Wrapper script for Infisical commands (same pattern as voqaria bff-service).
# Usage: ./scripts/infisical-run.sh <command>
#
# Required: INFISICAL_ENV, INFISICAL_PROJECT_ID (set in your shell or CI).
# Optional: INFISICAL_PATH (default /openai-gateway), INFISICAL_API_URL, INFISICAL_TOKEN / INFISICAL_TOKEN_ZYRETH

set -euo pipefail

INFISICAL_ENV=${INFISICAL_ENV}
INFISICAL_PATH=${INFISICAL_PATH:-/zyreth}
INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID:-}
INFISICAL_TOKEN="${INFISICAL_TOKEN_ZYRETH:-${INFISICAL_TOKEN}}"

INFISICAL_API_URL=${INFISICAL_API_URL:-https://infisical.lan}

if [ -z "${INFISICAL_ENV:-}" ]; then
  echo "Error: INFISICAL_ENV environment variable is required" >&2
  exit 1
fi

if [ -z "${INFISICAL_PATH:-}" ]; then
  echo "Error: INFISICAL_PATH environment variable is required" >&2
  exit 1
fi

if [ -z "${INFISICAL_PROJECT_ID:-}" ]; then
  echo "Error: INFISICAL_PROJECT_ID environment variable is required" >&2
  exit 1
fi

echo "∞ Infisical configuration: ∞"
echo "  - Environment: $INFISICAL_ENV"
echo "  - Path: $INFISICAL_PATH"
echo "  - Project ID: $INFISICAL_PROJECT_ID"
echo "  - API URL: $INFISICAL_API_URL"
if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
  echo "  - Token: ✅"
else
  echo "  - Token: ❌"
fi
echo ""

exec infisical run --token="$INFISICAL_TOKEN" --env="$INFISICAL_ENV" --path="$INFISICAL_PATH" --projectId="$INFISICAL_PROJECT_ID" -- "$@"
