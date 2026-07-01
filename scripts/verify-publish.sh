#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${APP_BASE_URL:-https://incentivamais-admin.lovable.app}"

check_marker() {
  local url="$1"
  local marker="$2"
  local html

  html="$(curl -L --max-time 20 -s "$url")"

  if command -v rg >/dev/null 2>&1; then
    if printf '%s' "$html" | rg -Fq "$marker"; then
      return 0
    fi
  elif printf '%s' "$html" | grep -Fq "$marker"; then
    return 0
  fi

  # Some route content is rendered after hydration. If the raw HTML misses the marker,
  # inspect the route's modulepreload assets as a second source of truth.
  local asset_paths asset_path asset_url asset_body

  if command -v rg >/dev/null 2>&1; then
    asset_paths="$(printf '%s' "$html" | rg -o '/assets/[^"]+\.js' || true)"
  else
    asset_paths="$(printf '%s' "$html" | grep -o '/assets/[^"]\+\.js' || true)"
  fi

  for asset_path in $asset_paths; do
    asset_url="${BASE_URL%/}${asset_path}"
    asset_body="$(curl -L --max-time 20 -s "$asset_url")"

    if command -v rg >/dev/null 2>&1; then
      if printf '%s' "$asset_body" | rg -Fq "$marker"; then
        return 0
      fi
    elif printf '%s' "$asset_body" | grep -Fq "$marker"; then
      return 0
    fi
  done

  echo "ERRO: marcador não encontrado em $url -> $marker" >&2
  return 1
}

echo "Validando publicação em: $BASE_URL"

check_marker "$BASE_URL/" "e-mail e senha"
check_marker "$BASE_URL/" "Criar senha e entrar"
check_marker "$BASE_URL/" "Acesso interno"
check_marker "$BASE_URL/configuracoes" "Sales Ops"
check_marker "$BASE_URL/configuracoes" "SDR"
check_marker "$BASE_URL/configuracoes" "Operações liberadas"
check_marker "$BASE_URL/configuracoes" "Gerar link de acesso"
check_marker "$BASE_URL/configuracoes" "Acessos emitidos"
check_marker "$BASE_URL/configuracoes" "Como o link funciona"

echo "OK: URL publicada refletiu os marcadores críticos da autenticação recorrente."
