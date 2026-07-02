#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${APP_BASE_URL:-https://incentivamais-admin.lovable.app}"

auth_mode="none"
wrangler_log="/tmp/admin-incentiva-wrangler-whoami.log"

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  auth_mode="token"
else
  if npx wrangler whoami >"$wrangler_log" 2>&1; then
    if ! rg -qi 'not authenticated|please run `wrangler login`' "$wrangler_log"; then
      auth_mode="wrangler-session"
    fi
  fi
fi

echo "1/4 Build local do corte final..."
cd "$ROOT_DIR"
npm run build >/tmp/admin-incentiva-cutover-build.log 2>&1
echo "OK: build concluído."

echo "2/4 Checando autenticação Cloudflare..."
case "$auth_mode" in
  token)
    echo "OK: autenticação pronta via CLOUDFLARE_API_TOKEN."
    ;;
  wrangler-session)
    echo "OK: autenticação pronta via sessão local do Wrangler."
    ;;
  *)
    echo "BLOQUEIO: sem autenticação Cloudflare no runtime."
    echo "Detalhe: nem CLOUDFLARE_API_TOKEN nem sessão válida do Wrangler estão disponíveis."
    ;;
esac

echo "3/4 Fotografando a URL pública atual..."
if curl -L --max-time 20 -s "$BASE_URL/portal" | python3 -c 'import sys; data=sys.stdin.buffer.read().replace(b"\x00", b"").decode("utf-8", "ignore"); markers=["Mês anterior","Reativação / retomada","Social Selling / conteúdo"]; print("portal_new" if all(m in data for m in markers) else "portal_old")' | grep -q "portal_new"; then
  echo "INFO: a URL pública já mostra o corte novo do Portal."
else
  echo "INFO: a URL pública ainda está no corte anterior do Portal."
fi

echo "4/4 Resumo de prontidão..."
if [[ "$auth_mode" == "none" ]]; then
  echo "READY=NO"
  echo "NEXT_STEP=normalizar credencial ou sessão do Cloudflare antes do cutover final"
  exit 1
fi

echo "READY=YES"
echo "NEXT_STEP=executar npm run cutover:final"
