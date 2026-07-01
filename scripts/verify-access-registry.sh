#!/usr/bin/env bash
set -euo pipefail

SUPABASE_URL="${ADMIN_INCENTIVA_SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
SUPABASE_TOKEN="${ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_ROLE:-}}}"

if [[ -z "${SUPABASE_URL}" ]]; then
  echo "Falta ADMIN_INCENTIVA_SUPABASE_URL ou VITE_SUPABASE_URL." >&2
  exit 1
fi

if [[ -z "${SUPABASE_TOKEN}" ]]; then
  echo "Falta ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SERVICE_ROLE(_KEY)." >&2
  exit 1
fi

BASE_URL="${SUPABASE_URL%/}/rest/v1/admin_access_registry_v1"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
HASH="verify-${STAMP}"
EMAIL="verify-access-registry-${STAMP}@incentivamais.local"
NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

read -r -d '' PAYLOAD <<JSON || true
{
  "access_identity_id": "verify-${STAMP}",
  "name": "Verify Access Registry",
  "email": "${EMAIL}",
  "profile_id": "sales",
  "access_package_id": "operacional_safe",
  "allowed_routes": ["/", "/clientes", "/performance"],
  "operation_ids": ["incentiva"],
  "default_visibility": "ops",
  "invite_token_hash": "${HASH}",
  "invited_by_identity_id": "claw-main",
  "invited_by_name": "Claw",
  "invite_issued_at": "${NOW_ISO}",
  "invite_expires_at": "2099-01-01T00:00:00Z",
  "invite_status": "issued"
}
JSON

curl_json() {
  curl -sS "$@" \
    -H "apikey: ${SUPABASE_TOKEN}" \
    -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
    -H "Content-Type: application/json"
}

INSERT_JSON="$(curl_json \
  "${BASE_URL}?select=*" \
  -H "Prefer: return=representation" \
  -d "${PAYLOAD}")"

READ_JSON="$(curl_json \
  "${BASE_URL}?select=invite_status,email,allowed_routes,operation_ids&invite_token_hash=eq.${HASH}")"

PATCH_JSON="$(curl_json \
  -X PATCH \
  "${BASE_URL}?invite_token_hash=eq.${HASH}&select=invite_status,revoked_reason" \
  -H "Prefer: return=representation" \
  -d '{"invite_status":"revoked","revoked_reason":"verify_script"}')"

DELETE_JSON="$(curl_json \
  -X DELETE \
  "${BASE_URL}?invite_token_hash=eq.${HASH}" \
  -H "Prefer: return=representation")"

python3 - <<'PY' "${INSERT_JSON}" "${READ_JSON}" "${PATCH_JSON}" "${DELETE_JSON}"
import json
import sys

insert = json.loads(sys.argv[1])
read = json.loads(sys.argv[2])
patch = json.loads(sys.argv[3])
delete = json.loads(sys.argv[4])

assert len(insert) == 1, insert
assert len(read) == 1 and read[0]["invite_status"] == "issued", read
assert len(patch) == 1 and patch[0]["invite_status"] == "revoked", patch
assert len(delete) == 1, delete

print("Access registry smoke OK")
PY
