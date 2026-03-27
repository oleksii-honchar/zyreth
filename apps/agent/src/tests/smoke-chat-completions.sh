#!/usr/bin/env bash
# Smoke test: POST /v1/chat/completions (OpenAI-shaped) against a running Zyreth agent.
#
# Usage (from repo root or this directory):
#   ./apps/agent/src/tests/smoke-chat-completions.sh
#   BASE_URL=http://localhost:3002 MODEL=zyreth ./apps/agent/src/tests/smoke-chat-completions.sh
#
# Requires: curl, jq. Server must be up (e.g. npm run dev in apps/agent) and any Mastra/API env configured.
# Success: HTTP 200 or 201 (Nest POST). Stdout = pretty-printed response (jq .).
# Stderr = request body (model + messages), then status. Chat completion responses do not echo request messages—only choices[].message.

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo 'smoke: jq is required (e.g. brew install jq)' >&2
  exit 1
fi

BASE_URL="${BASE_URL:-http://localhost:3002}"
MODEL="${MODEL:-zyreth}"

payload_file=$(mktemp)
body_file=$(mktemp)
trap 'rm -f "$payload_file" "$body_file"' EXIT

jq -n \
  --arg model "$MODEL" \
  '{model: $model, messages: [{role: "user", content: "ping"}]}' >"$payload_file"

echo 'smoke: request:' >&2
jq . "$payload_file" >&2

http_code=$(
  curl --globoff -sS -o "$body_file" -w '%{http_code}' \
    -X POST "${BASE_URL%/}/v1/chat/completions" \
    -H 'Content-Type: application/json' \
    --data-binary "@${payload_file}"
)

if [[ "$http_code" != "200" && "$http_code" != "201" ]]; then
  echo "smoke: expected HTTP 200 or 201, got ${http_code}" >&2
  jq . "$body_file" 2>/dev/null >&2 || cat "$body_file" >&2
  exit 1
fi

# OpenAI-shaped chat.completion from our gateway
if ! jq -e '
  .object == "chat.completion"
  and (.choices | type == "array")
  and (.choices | length > 0)
  and (.choices[0].message.role == "assistant")
  and (.choices[0].message.content | type == "string")
' "$body_file" >/dev/null; then
  echo 'smoke: response is not valid chat.completion JSON' >&2
  jq . "$body_file" 2>/dev/null >&2 || cat "$body_file" >&2
  exit 1
fi

echo "smoke: ok (${BASE_URL}/v1/chat/completions)" >&2
jq . "$body_file"
