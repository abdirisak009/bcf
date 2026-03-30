#!/usr/bin/env bash
# Build backend binary + Next.js production bundle. Run from repo root on the VPS.
# Usage: ./scripts/vps-deploy.sh
# By default runs `git pull --ff-only` when this directory is a git clone. To skip: SKIP_GIT_PULL=1 ./scripts/vps-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -d "$ROOT/.git" ]] && [[ "${SKIP_GIT_PULL:-0}" != "1" ]]; then
  echo "==> git pull --ff-only"
  git pull --ff-only
fi

echo "==> Go build (backend/bcf-api)"
(
  cd "$ROOT/backend"
  go build -o bcf-api ./cmd
)

echo "==> pnpm install + build"
if command -v corepack >/dev/null 2>&1; then
  corepack enable 2>/dev/null || true
fi
cd "$ROOT"
pnpm install --frozen-lockfile
pnpm build

echo "==> Done. Restart services if needed, e.g.: sudo systemctl restart bcf-api bcf-web"
