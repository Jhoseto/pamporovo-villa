#!/usr/bin/env bash
# First-time install on JetHost — runs ON THE SERVER inside ~/pamporovo-villa
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> JetHost first install check"
echo "    Root: $ROOT"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found."
  echo "  deploy-remote.ps1 should have uploaded it. Check SSH/SCP step."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git not found on server"
  exit 1
fi

bash scripts/deploy.sh
