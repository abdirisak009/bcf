#!/usr/bin/env bash
# Run on your laptop: diagnose why SSH to the VPS fails (port, firewall, keys, sshd).
#
# Usage:
#   ./scripts/vps-ssh-check.sh
#   VPS_HOST=62.72.35.109 VPS_USER=root ./scripts/vps-ssh-check.sh
#
set -uo pipefail

VPS_HOST="${VPS_HOST:-62.72.35.109}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"

echo "==> Target: ${VPS_USER}@${VPS_HOST} port ${VPS_PORT}"
echo ""

if command -v ping >/dev/null 2>&1; then
  echo "==> ICMP ping (non-fatal if blocked)"
  ping -c 2 -W 3 "$VPS_HOST" || echo "    (ping failed or blocked — continue)"
  echo ""
fi

echo "==> TCP connect to port ${VPS_PORT}"
if command -v nc >/dev/null 2>&1; then
  if nc -zvw5 "$VPS_HOST" "$VPS_PORT"; then
    echo "    Port is open."
  else
    echo "    FAIL: nothing listening or firewall DROP (fix on provider panel / VPS console)."
  fi
elif timeout 3 bash -c "echo >/dev/tcp/${VPS_HOST}/${VPS_PORT}" 2>/dev/null; then
  echo "    Port is open (bash /dev/tcp)."
else
  echo "    FAIL: cannot connect. Open port 22 in cloud firewall + ufw on server."
fi
echo ""

echo "==> SSH handshake (verbose, password not sent)"
SSH_TEST=(ssh -v -o ConnectTimeout=12 -o BatchMode=yes -o StrictHostKeyChecking=no -p "$VPS_PORT" "${VPS_USER}@${VPS_HOST}" "true")
if "${SSH_TEST[@]}" 2>/tmp/vps-ssh-check.log; then
  echo "    OK: key-based auth works (BatchMode)."
else
  echo "    BatchMode failed (expected if you only use password). Last lines:"
  tail -n 25 /tmp/vps-ssh-check.log 2>/dev/null || true
  echo ""
  echo "    Try: ssh -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST}"
  echo "    If 'Permission denied (publickey)': enable PasswordAuthentication on server OR add your pubkey."
  echo "    If 'Connection refused': sshd not running or wrong port."
  echo "    If timeout: firewall / security group / wrong IP."
fi
rm -f /tmp/vps-ssh-check.log
echo ""
echo "==> Done."
