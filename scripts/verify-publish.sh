#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${APP_BASE_URL:-https://incentivamais-admin.lovable.app}"

check_marker() {
  local url="$1"
  local marker="$2"

  if ! curl -L --max-time 20 -s "$url" | rg -Fq "$marker"; then
    echo "ERRO: marcador não encontrado em $url -> $marker" >&2
    return 1
  fi
}

echo "Validando publicação em: $BASE_URL"

check_marker "$BASE_URL/configuracoes" "Paridade da publicação final"
check_marker "$BASE_URL/configuracoes" "Checklist mínimo de cutover final"
check_marker "$BASE_URL/portal" "Prontidão do corte externo"
check_marker "$BASE_URL/portal" "Blockers do fechamento externo"

echo "OK: URL publicada refletiu os marcadores críticos do corte atual."
