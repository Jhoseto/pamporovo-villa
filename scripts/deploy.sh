#!/usr/bin/env bash
# Runs ON THE SERVER inside ~/pamporovo-villa
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$(basename "$ROOT")"
cd "$ROOT"

echo "==> Pamporovo Villa deploy"
echo "    Root: $ROOT"

# ── Locate Node.js (cPanel nodevenv — do NOT source activate, just prepend bin) ──
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

# CloudLinux fallback
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
  echo ""
  echo "ERROR: Node.js not found."
  echo "  → cPanel → Software → Setup Node.js App → CREATE APPLICATION"
  echo "    Node: 22  |  Mode: Production  |  Root: pamporovo-villa  |  Startup: dist/index.js"
  exit 1
fi

# ── Install dependencies (using npm — always available, no global install needed) ──
echo "==> Installing dependencies  (npm install)"
npm install --no-fund --no-audit 2>&1 | tail -3

# ── Build ─────────────────────────────────────────────────────────────────────
echo "==> Building  (npm run build)"
export NODE_ENV=production
npm run build

# ── Database sync ─────────────────────────────────────────────────────────────
echo "==> Syncing database schema"
node scripts/apply-pending-schema.mjs

# ── Runtime dirs ──────────────────────────────────────────────────────────────
mkdir -p data/notification-sounds

# ── Restart ───────────────────────────────────────────────────────────────────
if command -v cloudlinux-selector >/dev/null 2>&1; then
  echo "==> Restarting via cloudlinux-selector"
  cloudlinux-selector restart --json --interpreter nodejs \
    --app-root "$APP_DIR" 2>/dev/null || true
fi

SITE_URL="${SITE_URL:-}"
echo ""
echo "====================================="
echo " Deploy OK!"
echo "====================================="
[ -n "$SITE_URL" ] && echo "  Site:   ${SITE_URL}/"
[ -n "$SITE_URL" ] && echo "  Admin:  ${SITE_URL}/admin"
[ -n "$SITE_URL" ] && echo "  Health: ${SITE_URL}/health"
echo ""
echo "  If app shows 503:"
echo "  cPanel → Setup Node.js App → pamporovo-villa → Restart"
