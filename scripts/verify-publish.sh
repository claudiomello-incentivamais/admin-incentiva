#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${APP_BASE_URL:-https://incentivamais-admin.lovable.app}"

normalize_payload() {
  python3 -c '
import pathlib, sys
data = pathlib.Path(sys.argv[1]).read_bytes()
sys.stdout.write(data.replace(b"\x00", b"").decode("utf-8", "ignore"))
' "$1"
}

check_marker() {
  local url="$1"
  local marker="$2"
  local asset_hint="${3:-}"
  local tmp_html tmp_asset html asset_body asset_catalog
  local -a asset_paths=()

  tmp_html="$(mktemp)"
  curl -L --max-time 20 -s "$url" -o "$tmp_html"
  html="$(normalize_payload "$tmp_html")"
  rm -f "$tmp_html"

  if command -v rg >/dev/null 2>&1; then
    if printf '%s' "$html" | rg -Fq "$marker"; then
      return 0
    fi
  elif printf '%s' "$html" | grep -Fq "$marker"; then
    return 0
  fi

  # Some route content is rendered after hydration. If the raw HTML misses the marker,
  # inspect the route's modulepreload assets as a second source of truth.
  local asset_path asset_url

  if command -v rg >/dev/null 2>&1; then
    asset_catalog="$(printf '%s' "$html" | rg -o '/assets/[^"]+\.js' || true)"
  else
    asset_catalog="$(printf '%s' "$html" | grep -o '/assets/[^"]\+\.js' || true)"
  fi

  if [[ -n "$asset_hint" ]]; then
    while IFS= read -r asset_path; do
      [[ -z "$asset_path" ]] && continue
      if [[ "$asset_path" == *"$asset_hint"* || "$asset_path" == *"index-"* ]]; then
        asset_paths+=("$asset_path")
      fi
    done <<< "$asset_catalog"
  fi

  if [[ ${#asset_paths[@]} -eq 0 ]]; then
    while IFS= read -r asset_path; do
      [[ -z "$asset_path" ]] && continue
      asset_paths+=("$asset_path")
    done <<< "$asset_catalog"
  fi

  mapfile -t asset_paths < <(printf '%s\n' "${asset_paths[@]}" | awk '!seen[$0]++')

  for asset_path in "${asset_paths[@]}"; do
    asset_url="${BASE_URL%/}${asset_path}"
    tmp_asset="$(mktemp)"
    curl -L --max-time 20 -s "$asset_url" -o "$tmp_asset"
    asset_body="$(normalize_payload "$tmp_asset")"
    rm -f "$tmp_asset"

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
check_marker "$BASE_URL/configuracoes" "Sales Ops" "configuracoes"
check_marker "$BASE_URL/configuracoes" "SDR" "configuracoes"
check_marker "$BASE_URL/configuracoes" "Operações liberadas" "configuracoes"
check_marker "$BASE_URL/configuracoes" "Gerar link de acesso" "configuracoes"
check_marker "$BASE_URL/configuracoes" "Acessos emitidos" "configuracoes"
check_marker "$BASE_URL/configuracoes" "Como o link funciona" "configuracoes"
check_marker "$BASE_URL/portal" "Mês anterior" "portal"
check_marker "$BASE_URL/portal" "Setor" "portal"
check_marker "$BASE_URL/portal" "Porte" "portal"
check_marker "$BASE_URL/portal" "Cargo" "portal"
check_marker "$BASE_URL/portal" "Reativação / retomada" "portal"
check_marker "$BASE_URL/portal" "Social Selling / conteúdo" "portal"

echo "OK: URL publicada refletiu os marcadores críticos de autenticação, Configurações e Portal."
