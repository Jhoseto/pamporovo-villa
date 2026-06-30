#!/usr/bin/env bash
# First-time or full reinstall on JetHost (run ON THE SERVER in ~/pamporovo-villa).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> JetHost first install"
echo "    Root: $ROOT"

if [[ ! -f .env ]]; then
  echo "ERROR: Missing .env in $ROOT"
  echo "Run deploy-remote.ps1 from your PC, or copy .env.production.local to .env"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is not available"
  exit 1
fi

bash scripts/deploy.sh

if grep -q "^SITE_URL=" .env; then
  SITE_URL="$(grep '^SITE_URL=' .env | cut -d= -f2- | tr -d '\r')"
  if [[ "$SITE_URL" != https://YOUR-TEMP-URL-HERE* && "$SITE_URL" != http://YOUR-TEMP* ]]; then
    echo ""
    echo "==> Health check"
    if command -v curl >/dev/null 2>&1; then
      curl -fsS "${SITE_URL%/}/health" && echo "" || echo "WARN: /health not reachable yet (Node app may need cPanel Restart)"
    fi
  fi
fi

echo ""
echo "==> First install complete"
echo "If the site is not live: cPanel -> Setup Node.js App -> Startup file dist/index.js -> Restart"
