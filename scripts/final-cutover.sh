#!/usr/bin/env bash
set -euo pipefail

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

if [[ "$auth_mode" == "none" ]]; then
  echo "ERRO: autenticação Cloudflare indisponível no runtime." >&2
  echo "Saída: o deploy final continua bloqueado até existir CLOUDFLARE_API_TOKEN ou sessão válida do Wrangler." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Auth mode: $auth_mode"
echo "1/3 Buildando o projeto..."
cd "$ROOT_DIR"
npm run build

echo "2/3 Executando deploy pré-build..."
npm run deploy:prebuilt

echo "3/3 Validando a URL publicada..."
npm run verify:publish

echo "OK: cutover final executado e validado."
