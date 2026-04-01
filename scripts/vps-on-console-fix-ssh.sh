#!/usr/bin/env bash
# RUN ON THE VPS via provider Web console / recovery shell when your PC cannot SSH in.
# Re-harden (keys only, no root password) after you regain access.
#
#   bash scripts/vps-on-console-fix-ssh.sh
#
set -euo pipefail

echo "==> Bararug VPS — SSH recovery (ufw + sshd)"

if [[ "${EUID:-0}" -ne 0 ]] && [[ "$(id -u)" -ne 0 ]]; then
  echo "error: run as root (sudo -i)"
  exit 1
fi

# 1) Firewall
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH 2>/dev/null || true
  ufw allow 22/tcp 2>/dev/null || true
  echo "==> ufw status:"
  ufw status verbose || true
fi

# 2) sshd drop-in (Ubuntu 22+ includes /etc/ssh/sshd_config.d/*.conf)
mkdir -p /etc/ssh/sshd_config.d
DROPIN="/etc/ssh/sshd_config.d/99-bararug-recovery.conf"
if [[ ! -f "$DROPIN" ]]; then
  cp -a /etc/ssh/sshd_config "/etc/ssh/sshd_config.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
fi

cat >"$DROPIN" <<'EOF'
# Temporary recovery — remove this file after ssh-copy-id works
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
KbdInteractiveAuthentication yes
EOF
chmod 644 "$DROPIN"

# 3) Restart SSH
if systemctl list-units --type=service | grep -q '^ssh\.service'; then
  systemctl restart ssh
elif systemctl list-units --type=service | grep -q '^sshd\.service'; then
  systemctl restart sshd
else
  systemctl restart ssh 2>/dev/null || systemctl restart sshd
fi

if sshd -t 2>/dev/null; then
  echo "==> sshd -t OK"
else
  echo "error: sshd -t failed — remove $DROPIN and restore backup"
  exit 1
fi

echo ""
echo "==> Try from laptop:  ssh root@SERVER_IP"
echo "==> Then:            ssh-copy-id root@SERVER_IP"
echo "==> Then delete:     rm $DROPIN && systemctl restart ssh"
