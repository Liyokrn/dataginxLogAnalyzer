#!/usr/bin/env bash
# ============================================================================
# deploy_offline.sh - Script de Instalación Offline para Agente Vector
# Ejecutar en el servidor destino (QA/PROD) sin acceso a internet.
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}║             Despliegue Offline del Agente Vector                     ║${NC}"
echo -e "${CYAN}========================================================================${NC}"
echo ""

# 1. Configuración Interactiva de Variables de Entorno
DEFAULT_BACKEND_URL="http://10.100.225.249:3001/api/ingest"
DEFAULT_INGEST_KEY="default"
DEFAULT_NGINX_PATH="/var/log/nginx/*.log"
DEFAULT_PHP_FPM_PATH="/var/log/php*-fpm.log"
DEFAULT_PHP_SLOW_PATH="/var/log/php*-slow.log"

read -p "Ingresa BACKEND_URL [$DEFAULT_BACKEND_URL]: " input_backend
BACKEND_URL=${input_backend:-$DEFAULT_BACKEND_URL}

read -p "Ingresa INGEST_API_KEY [$DEFAULT_INGEST_KEY]: " input_key
INGEST_API_KEY=${input_key:-$DEFAULT_INGEST_KEY}

read -p "Ingresa NGINX_LOG_PATH [$DEFAULT_NGINX_PATH]: " input_nginx
NGINX_LOG_PATH=${input_nginx:-$DEFAULT_NGINX_PATH}

read -p "Ingresa PHP_FPM_LOG_PATH [$DEFAULT_PHP_FPM_PATH]: " input_fpm
PHP_FPM_LOG_PATH=${input_fpm:-$DEFAULT_PHP_FPM_PATH}

read -p "Ingresa PHP_SLOW_LOG_PATH [$DEFAULT_PHP_SLOW_PATH]: " input_slow
PHP_SLOW_LOG_PATH=${input_slow:-$DEFAULT_PHP_SLOW_PATH}

# 2. Generar el archivo de entorno /etc/default/vector
echo -e "\n==> Guardando variables de entorno en /etc/default/vector..."
sudo mkdir -p /etc/default
sudo bash -c "cat > /etc/default/vector" <<EOF
# Variables de entorno para el servicio Vector
BACKEND_URL=${BACKEND_URL}
INGEST_API_KEY=${INGEST_API_KEY}
NGINX_LOG_PATH=${NGINX_LOG_PATH}
PHP_FPM_LOG_PATH=${PHP_FPM_LOG_PATH}
PHP_SLOW_LOG_PATH=${PHP_SLOW_LOG_PATH}
EOF

# 3. Copiar el binario de Vector a la ruta global
echo -e "==> Instalando binario de Vector..."
if [ -f "./vector" ]; then
  sudo cp ./vector /usr/local/bin/vector
  sudo chmod +x /usr/local/bin/vector
  echo -e "  ${GREEN}✔ Binario instalado en /usr/local/bin/vector${NC}"
else
  echo -e "  ${RED}✘ Error: No se encontró el ejecutable 'vector' en el directorio actual.${NC}"
  exit 1
fi

# 4. Copiar archivo de configuración vector.toml
echo -e "==> Copiando configuración vector.toml..."
sudo mkdir -p /etc/vector
if [ -f "./vector.toml" ]; then
  sudo cp ./vector.toml /etc/vector/vector.toml
  echo -e "  ${GREEN}✔ Configuración instalada en /etc/vector/vector.toml${NC}"
else
  echo -e "  ${RED}✘ Error: No se encontró 'vector.toml' en el directorio actual.${NC}"
  exit 1
fi

# 5. Crear el archivo de servicio systemd
echo -e "==> Configurando servicio de systemd..."
SERVICE_FILE="/etc/systemd/system/vector.service"
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
echo -e "  ${GREEN}✔ Servicio vector.service configurado${NC}"

# 6. Iniciar y habilitar el servicio
echo -e "==> Habilitando e iniciando servicio Vector..."
sudo systemctl enable --now vector

echo -e "\n${GREEN}========================================================================${NC}"
echo -e "${GREEN}✔ ¡Agente Vector instalado y corriendo correctamente en segundo plano!  ${NC}"
echo -e "${GREEN}========================================================================${NC}"
