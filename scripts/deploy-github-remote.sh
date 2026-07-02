#!/usr/bin/env bash
# Runs on JetHost after GitHub Actions uploads app.tar.gz + deps.tar.gz to ~/
set -uo pipefail

APP_DIR="${1:-pamporovo-villa}"
APP_ROOT="$HOME/$APP_DIR"

log() { echo "==> $*"; }
fail() { echo "ERROR: $*" >&2; exit 1; }

log "Deploy target: $APP_ROOT"
[ -d "$APP_ROOT" ] || fail "App directory not found: $APP_ROOT"
[ -f "$HOME/app.tar.gz" ] || fail "Missing ~/app.tar.gz upload"
[ -f "$HOME/deps.tar.gz" ] || fail "Missing ~/deps.tar.gz upload"

cd "$APP_ROOT" || fail "Cannot cd to $APP_ROOT"

log "Extracting app archive"
tar -xzf "$HOME/app.tar.gz" || fail "app.tar.gz extract failed"
rm -f "$HOME/app.tar.gz"

if [ -f .env.production ]; then
  mv -f .env.production .env
  log "Updated .env from deployment"
else
  log "WARN: .env.production missing in archive — keeping existing .env"
fi

log "Extracting node_modules"
if [ -L node_modules ]; then rm -f node_modules; fi
rm -rf node_modules
tar -xzf "$HOME/deps.tar.gz" || fail "deps.tar.gz extract failed"
rm -f "$HOME/deps.tar.gz"
echo "node_modules size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo unknown)"

mkdir -p data/notification-sounds

NODE_BIN=""
for ver in 24 22 20 18; do
  candidate="$HOME/nodevenv/$APP_DIR/$ver/bin/node"
  if [ -x "$candidate" ]; then
    NODE_BIN="$candidate"
    log "Using Node $( "$NODE_BIN" -v ) at $candidate"
    break
  fi
done

if [ -n "$NODE_BIN" ]; then
  log "Syncing database schema"
  "$NODE_BIN" scripts/apply-pending-schema.mjs || log "WARN: schema sync failed (non-fatal)"

  log "Syncing master admin password"
  "$NODE_BIN" scripts/reset-master-admin.mjs || log "WARN: admin sync failed (non-fatal)"
else
  log "WARN: nodevenv not found — skipped schema/admin scripts"
fi

log "Restarting app"
if command -v cloudlinux-selector >/dev/null 2>&1; then
  cloudlinux-selector restart --json --interpreter nodejs --app-root "$APP_DIR" 2>/dev/null \
    || log "WARN: cloudlinux-selector restart returned non-zero"
else
  log "WARN: cloudlinux-selector not available"
fi

log "Deploy complete"
