#!/usr/bin/env bash
# Creates or updates ONE user with role=admin (full dashboard access; no per-row permissions needed).
# Run on the VPS from the machine that can reach PostgreSQL with the same credentials as the Go API.
#
# Usage:
#   cd backend
#   ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='at-least-8-chars' ./scripts/create-admin.sh
#
# VPS host shell (Postgres published on localhost; .env has DB_HOST=postgres_db):
#   SEED_USE_HOST_POSTGRES=1 ADMIN_EMAIL=... ADMIN_PASSWORD='...' ./scripts/create-admin.sh
#
# Or put ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env then:
#   ./scripts/create-admin.sh
#
# Docker: if the API container has /app/seed-admin (you built it with: make build-seed-admin and copied it in):
#   DOCKER_CONTAINER=my-api-container-name ./scripts/create-admin.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

# On the VPS host shell, .env often has DB_HOST=postgres_db (Docker DNS). That hostname does not
# resolve outside containers. Set SEED_USE_HOST_POSTGRES=1 to connect via localhost (port must be published).
if [[ "${SEED_USE_HOST_POSTGRES:-0}" == "1" ]]; then
  export DB_HOST="${SEED_DB_HOST:-127.0.0.1}"
  export DB_PORT="${SEED_DB_PORT:-${DB_PORT:-5433}}"
  echo "==> SEED_USE_HOST_POSTGRES: DB_HOST=$DB_HOST DB_PORT=$DB_PORT"
fi

ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

usage() {
  echo "Creates/updates an admin user (bcrypt password, role=admin, full dashboard access)."
  echo ""
  echo "Usage:"
  echo "  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='your-password-8+chars' $0"
  echo "Or set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env"
  echo ""
  exit 1
}

[[ -n "$ADMIN_EMAIL" && -n "$ADMIN_PASSWORD" ]] || usage
if [[ ${#ADMIN_PASSWORD} -lt 8 ]]; then
  echo "error: ADMIN_PASSWORD must be at least 8 characters (same as app registration)."
  exit 1
fi

export ADMIN_EMAIL ADMIN_PASSWORD

run_seed() {
  if [[ -n "${DOCKER_CONTAINER:-}" ]]; then
    echo "Using docker exec: $DOCKER_CONTAINER (expects /app/seed-admin)"
    docker exec \
      -e ADMIN_EMAIL \
      -e ADMIN_PASSWORD \
      -w /app \
      "$DOCKER_CONTAINER" \
      ./seed-admin
    return
  fi

  if [[ -x "$ROOT/seed-admin" ]]; then
    echo "Running: $ROOT/seed-admin"
    exec "$ROOT/seed-admin"
  fi

  if command -v go >/dev/null 2>&1; then
    echo "Running: go run ./cmd/seed-admin"
    exec go run ./cmd/seed-admin
  fi

  echo "error: Need one of:"
  echo "  - Go installed (apt install golang-go), or"
  echo "  - Copy a prebuilt binary to backend/seed-admin:"
  echo "      (on your PC) cd backend && go build -o seed-admin ./cmd/seed-admin"
  echo "      scp seed-admin user@vps:~/bcf/backend/"
  echo "  - Or set DOCKER_CONTAINER to an API container that has ./seed-admin inside /app"
  exit 1
}

run_seed
