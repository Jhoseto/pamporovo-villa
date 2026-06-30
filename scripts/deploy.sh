#!/usr/bin/env bash
# Production deploy on JetHost (run from project root via SSH or GitHub Actions).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pamporovo Villa deploy"
echo "    Root: $ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "==> Installing pnpm via npm"
  npm install -g pnpm@10.4.1 --quiet
fi

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building (site + admin + API)"
export NODE_ENV=production
pnpm build

echo "==> Syncing database schema"
pnpm db:sync

echo "==> Ensuring writable data directories"
mkdir -p data/notification-sounds

if command -v cloudlinux-selector >/dev/null 2>&1; then
  APP_ROOT="${JETHOST_APP_ROOT:-pamporovo-villa}"
  echo "==> Restarting Node.js app (cloudlinux-selector)"
  cloudlinux-selector restart --json --interpreter nodejs --app-root "$HOME/$APP_ROOT" || true
fi

echo ""
echo "Deploy finished."
echo "If the site did not refresh, open cPanel -> Setup Node.js App -> Restart."
echo "Health check: curl -s https://YOUR-URL/health"
