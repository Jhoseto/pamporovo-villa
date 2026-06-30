#!/usr/bin/env bash
# Production deploy — runs ON THE SERVER inside ~/pamporovo-villa
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pamporovo Villa deploy"
echo "    Root: $ROOT"

# ── Find Node.js ─────────────────────────────────────────────────────────────
# Priority: 1) cPanel nodevenv  2) CloudLinux alt-nodejs  3) PATH
find_node_bin() {
  local appdir
  appdir="$(basename "$ROOT")"   # pamporovo-villa

  # 1. cPanel nodevenv (created when you click CREATE in Setup Node.js App)
  for ver in 22 20 18; do
    local venv="$HOME/nodevenv/${appdir}/${ver}/bin/activate"
    if [ -f "$venv" ]; then
      # shellcheck disable=SC1090
      source "$venv"
      echo "    Node.js env: ~/nodevenv/${appdir}/${ver}" >&2
      command -v node
      return
    fi
  done

  # 2. CloudLinux alt-nodejs (standard on JetHost/cPanel servers)
  for ver in 22 20 18; do
    local bin="/opt/alt/alt-nodejs${ver}/root/usr/bin/node"
    if [ -x "$bin" ]; then
      export PATH="/opt/alt/alt-nodejs${ver}/root/usr/bin:$PATH"
      echo "    Node.js bin: /opt/alt/alt-nodejs${ver}" >&2
      echo "$bin"
      return
    fi
  done

  # 3. PATH fallback
  if command -v node >/dev/null 2>&1; then
    command -v node
    return
  fi

  echo "ERROR: Node.js not found." >&2
  echo "  → Open cPanel → Software → Setup Node.js App → CREATE APPLICATION" >&2
  echo "    Node: 22, Mode: Production, Root: pamporovo-villa, Startup: dist/index.js" >&2
  exit 1
}

NODE="$(find_node_bin)"
echo "    node: $NODE ($(node -v))"

# ── Install pnpm ─────────────────────────────────────────────────────────────
if ! command -v pnpm >/dev/null 2>&1; then
  echo "==> Installing pnpm"
  npm install -g pnpm@10.4.1 --quiet --no-fund --no-audit
fi
echo "    pnpm: $(pnpm -v)"

# ── Install dependencies ─────────────────────────────────────────────────────
echo "==> Installing dependencies"
pnpm install --frozen-lockfile --prefer-offline 2>&1 | tail -3

# ── Build ─────────────────────────────────────────────────────────────────────
echo "==> Building (Vite + esbuild)"
export NODE_ENV=production
pnpm build

# ── Database schema sync ──────────────────────────────────────────────────────
echo "==> Syncing database schema"
node scripts/apply-pending-schema.mjs

# ── Runtime directories ───────────────────────────────────────────────────────
mkdir -p data/notification-sounds

# ── Restart app (if cloudlinux-selector is available) ────────────────────────
if command -v cloudlinux-selector >/dev/null 2>&1; then
  echo "==> Restarting via cloudlinux-selector"
  cloudlinux-selector restart --json --interpreter nodejs \
    --app-root "$(basename "$ROOT")" 2>/dev/null || true
fi

echo ""
echo "====================================="
echo " Deploy finished!"
echo "====================================="
echo " Site:   ${SITE_URL:-<set SITE_URL in .env>}/"
echo " Admin:  ${SITE_URL:-<set SITE_URL in .env>}/admin"
echo " Health: ${SITE_URL:-<set SITE_URL in .env>}/health"
echo ""
echo " If app is not running:"
echo "   cPanel → Setup Node.js App → pamporovo-villa → Restart"
