#!/usr/bin/env bash
# Runs ON THE SERVER — dist/ already uploaded by deploy-remote.ps1
# Only installs production deps, syncs DB, restarts app.
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$(basename "$ROOT")"
cd "$ROOT"

echo "==> Pamporovo Villa server deploy"
echo "    Root: $ROOT"

# ── Require dist/ ─────────────────────────────────────────────────────────────
if [ ! -f dist/index.js ]; then
  echo "ERROR: dist/index.js not found."
  echo "  deploy-remote.ps1 should have uploaded dist/ before calling this script."
  exit 1
fi

# ── Locate Node.js (cPanel nodevenv — prepend bin dir, do NOT source activate) ──
NODE_BIN=""
for ver in 22 20 18; do
  candidate="$HOME/nodevenv/${APP_DIR}/${ver}/bin"
  if [ -x "${candidate}/node" ]; then
    export PATH="${candidate}:$PATH"
    NODE_BIN="${candidate}/node"
    echo "    Node.js: ~/nodevenv/${APP_DIR}/${ver}/bin  ($(node -v), npm $(npm -v))"
    break
  fi
done

if [ -z "$NODE_BIN" ]; then
  for ver in 22 20 18; do
    candidate="/opt/alt/alt-nodejs${ver}/root/usr/bin"
    if [ -x "${candidate}/node" ]; then
      export PATH="${candidate}:$PATH"
      NODE_BIN="${candidate}/node"
      echo "    Node.js: /opt/alt/alt-nodejs${ver}  ($(node -v), npm $(npm -v))"
      break
    fi
  done
fi

if [ -z "$NODE_BIN" ]; then
  echo "ERROR: Node.js not found."
  echo "  → cPanel → Software → Setup Node.js App → CREATE APPLICATION"
  echo "    Node: 22 | Mode: Production | Root: pamporovo-villa | Startup: dist/index.js"
  exit 1
fi

# ── Install production dependencies only (lightweight, no build tools needed) ──
echo "==> Installing production dependencies  (npm install --omit=dev)"
export NODE_ENV=production
npm install --omit=dev --legacy-peer-deps --no-fund --no-audit 2>&1 | tail -3

# ── Database sync ─────────────────────────────────────────────────────────────
echo "==> Syncing database schema"
node scripts/apply-pending-schema.mjs

# ── Runtime dirs ──────────────────────────────────────────────────────────────
mkdir -p data/notification-sounds

# ── Restart app ───────────────────────────────────────────────────────────────
if command -v cloudlinux-selector >/dev/null 2>&1; then
  echo "==> Restarting via cloudlinux-selector"
  cloudlinux-selector restart --json --interpreter nodejs \
    --app-root "$APP_DIR" 2>/dev/null || true
fi

SITE_URL="${SITE_URL:-}"
echo ""
echo "====================================="
echo " Server deploy OK!"
echo "====================================="
[ -n "$SITE_URL" ] && echo "  Site:   ${SITE_URL}/"
[ -n "$SITE_URL" ] && echo "  Admin:  ${SITE_URL}/admin"
echo ""
echo "  If 503: cPanel → Setup Node.js App → pamporovo-villa → Restart"
