#!/usr/bin/env bash
# SSH to VPS and create/update admin user. Uses Postgres on 127.0.0.1 (published port), not Docker hostname postgres_db.
#
# Never commit real passwords. Example:
#   ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='8+chars' ./scripts/vps-ssh-seed-admin.sh
#
# Optional: VPS_HOST VPS_USER VPS_BACKEND SEED_DB_PORT
# SSH key: ssh-copy-id root@62.72.35.109
# With sshpass: SSHPASS='ssh-login-password' sshpass -e ./scripts/vps-ssh-seed-admin.sh
#
set -euo pipefail

VPS_HOST="${VPS_HOST:-62.72.35.109}"
VPS_USER="${VPS_USER:-root}"
# Absolute path avoids ~ quoting issues over SSH
VPS_BACKEND="${VPS_BACKEND:-/root/bcf/backend}"
VPS_PORT="${VPS_PORT:-22}"
SEED_DB_PORT="${SEED_DB_PORT:-5433}"
# Extra ssh options (NAT drops, etc.): export VPS_SSH_OPTS='-o ServerAliveInterval=30 -o IPQoS=throughput'
VPS_SSH_OPTS="${VPS_SSH_OPTS:-}"

ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
  echo "error: set ADMIN_EMAIL and ADMIN_PASSWORD"
  exit 1
fi
if [[ ${#ADMIN_PASSWORD} -lt 8 ]]; then
  echo "error: ADMIN_PASSWORD must be at least 8 characters."
  exit 1
fi

# Remote one-liner, all values shell-escaped for the remote bash
REMOTE=$(printf \
  'cd %q && SEED_USE_HOST_POSTGRES=1 SEED_DB_PORT=%q ADMIN_EMAIL=%q ADMIN_PASSWORD=%q exec ./scripts/create-admin.sh' \
  "$VPS_BACKEND" "$SEED_DB_PORT" "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

echo "==> ssh ${VPS_USER}@${VPS_HOST}  (DB 127.0.0.1:${SEED_DB_PORT}, repo ${VPS_BACKEND})"

# shellcheck disable=SC2206
SSH=(ssh -p "$VPS_PORT" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=25 ${VPS_SSH_OPTS} "${VPS_USER}@${VPS_HOST}")
if command -v sshpass >/dev/null 2>&1 && [[ -n "${SSHPASS:-}" ]]; then
  SSH=(sshpass -e "${SSH[@]}")
fi

"${SSH[@]}" "bash -lc $(printf '%q' "$REMOTE")"
