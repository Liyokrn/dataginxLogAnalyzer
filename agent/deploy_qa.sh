#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Phase 6: Vector Deployment Script for QA Environment <==${NC}"

# 1. Download and install Vector
echo -e "${GREEN}==> Downloading and installing Vector...${NC}"
if ! command -v vector &> /dev/null; then
  # Official Vector installer script
  curl --proto '=https' --tlsv1.2 -sSf https://sh.vector.dev | sh -s -- -y
  
  # Link vector binary to /usr/local/bin so it is in global PATH and systemd can locate it
  if [ -f "$HOME/.vector/bin/vector" ]; then
    sudo ln -sf "$HOME/.vector/bin/vector" /usr/local/bin/vector
  fi
else
  echo -e "${GREEN}Vector is already installed.${NC}"
fi

# 2. Copy the validated vector.toml to /etc/vector/vector.toml
echo -e "${GREEN}==> Configuring Vector...${NC}"
sudo mkdir -p /etc/vector

# Locate the config relative to script path
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
LOCAL_TOML="${SCRIPT_DIR}/vector.toml"

if [ -f "$LOCAL_TOML" ]; then
  sudo cp "$LOCAL_TOML" /etc/vector/vector.toml
  echo -e "${GREEN}Copied ${LOCAL_TOML} to /etc/vector/vector.toml successfully.${NC}"
else
  echo -e "${RED}Error: Local vector.toml not found at ${LOCAL_TOML}${NC}"
  exit 1
fi

# 3. Enable and start Vector service
echo -e "${GREEN}==> Enabling and starting Vector service...${NC}"
# If installed via curl script, we create the systemd unit file manually if missing
SERVICE_FILE="/etc/systemd/system/vector.service"
if [ ! -f "$SERVICE_FILE" ]; then
  echo -e "${GREEN}Creating systemd service for Vector...${NC}"
  sudo bash -c "cat > ${SERVICE_FILE}" <<EOF
[Unit]
Description=Vector CLI agent
Documentation=https://vector.dev
After=network-online.target
Requires=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/vector --config /etc/vector/vector.toml
Restart=on-failure
EnvironmentFile=-/etc/default/vector

[Install]
WantedBy=multi-user.target
EOF
  sudo systemctl daemon-reload
fi

sudo systemctl enable --now vector
echo -e "${GREEN}==> Vector has been successfully deployed and started!${NC}"
