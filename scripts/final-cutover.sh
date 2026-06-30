#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERRO: CLOUDFLARE_API_TOKEN não está disponível no runtime." >&2
  echo "Saída: o deploy final continua bloqueado até a credencial existir." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "1/3 Buildando o projeto..."
cd "$ROOT_DIR"
npm run build

echo "2/3 Executando deploy pré-build..."
npm run deploy:prebuilt

echo "3/3 Validando a URL publicada..."
npm run verify:publish

echo "OK: cutover final executado e validado."
