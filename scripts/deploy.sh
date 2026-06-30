#!/usr/bin/env bash
# Runs ON THE SERVER inside ~/pamporovo-villa
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$(basename "$ROOT")"
cd "$ROOT"

echo "==> Pamporovo Villa deploy"
echo "    Root: $ROOT"

# ── Locate Node.js ────────────────────────────────────────────────────────────
# cPanel nodevenv: bin is at ~/nodevenv/<app-dir>/<ver>/bin
# Do NOT source the activate script — it requires CL_VIRTUAL_ENV which is only
# set in interactive cPanel sessions. Directly prepend the bin dir instead.
NODE_BIN=""
for ver in 22 20 18; do
  candidate="$HOME/nodevenv/${APP_DIR}/${ver}/bin"
  if [ -x "${candidate}/node" ]; then
    export PATH="${candidate}:$PATH"
    NODE_BIN="${candidate}/node"
    echo "    Node.js: ~/nodevenv/${APP_DIR}/${ver}/bin ($(node -v))"
    break
  fi
done

# CloudLinux alt-nodejs (fallback)
if [ -z "$NODE_BIN" ]; then
  for ver in 22 20 18; do
    candidate="/opt/alt/alt-nodejs${ver}/root/usr/bin"
    if [ -x "${candidate}/node" ]; then
      export PATH="${candidate}:$PATH"
      NODE_BIN="${candidate}/node"
      echo "    Node.js: /opt/alt/alt-nodejs${ver} ($(node -v))"
      break
    fi
  done
fi

# PATH fallback
if [ -z "$NODE_BIN" ] && command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
  echo "    Node.js: PATH ($(node -v))"
fi

if [ -z "$NODE_BIN" ]; then
  echo ""
  echo "ERROR: Node.js not found."
  echo "  → cPanel → Software → Setup Node.js App → CREATE APPLICATION"
  echo "    Node: 22, Mode: Production, Root: pamporovo-villa, Startup: dist/index.js"
  exit 1
fi

# ── Install pnpm ──────────────────────────────────────────────────────────────
# After `npm install -g`, the binary lands in $(npm config get prefix)/bin
# which may not be in PATH yet — prepend it explicitly.
NPM_GLOBAL_BIN="$(npm config get prefix)/bin"
export PATH="${NPM_GLOBAL_BIN}:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "==> Installing pnpm"
  npm install -g pnpm@10.4.1 --quiet --no-fund --no-audit
  # Refresh PATH in case npm wrote to a different prefix
  NPM_GLOBAL_BIN="$(npm config get prefix)/bin"
  export PATH="${NPM_GLOBAL_BIN}:$PATH"
fi
echo "    pnpm: $(pnpm -v)"

# ── Install dependencies ──────────────────────────────────────────────────────
echo "==> Installing dependencies"
pnpm install --frozen-lockfile 2>&1 | tail -5

# ── Build ─────────────────────────────────────────────────────────────────────
echo "==> Building"
export NODE_ENV=production
pnpm build

# ── Database sync ─────────────────────────────────────────────────────────────
echo "==> Syncing database schema"
node scripts/apply-pending-schema.mjs

# ── Directories ───────────────────────────────────────────────────────────────
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
echo " Deploy finished!"
echo "====================================="
[ -n "$SITE_URL" ] && echo " Site:   ${SITE_URL}/"
[ -n "$SITE_URL" ] && echo " Admin:  ${SITE_URL}/admin"
[ -n "$SITE_URL" ] && echo " Health: ${SITE_URL}/health"
echo ""
echo " If app shows 503:"
echo "   cPanel → Setup Node.js App → pamporovo-villa → Restart"
