#!/usr/bin/env bash
# ============================================================================
# build_offline_bundle.sh - Empaquetador offline para el Agente Vector
# Ejecutar en una máquina con acceso a internet.
# ============================================================================

set -euo pipefail

VECTOR_VERSION="0.40.0"
AGENT_VERSION="v1.1.0"
TAR_FILE="vector-${VECTOR_VERSION}-x86_64-unknown-linux-musl.tar.gz"
DOWNLOAD_URL="https://github.com/vectordotdev/vector/releases/download/v${VECTOR_VERSION}/${TAR_FILE}"

TEMP_DIR="vector-offline-temp"
BUNDLE_NAME="vector-agent-${AGENT_VERSION}.tar.gz"

echo "==> Iniciando creación de bundle offline para Vector v${VECTOR_VERSION}..."

# 1. Crear directorio temporal
mkdir -p "$TEMP_DIR"

# 2. Descargar el binario oficial
if [ ! -f "$TAR_FILE" ]; then
  echo "==> Descargando binario estático de Vector desde GitHub..."
  curl -L -o "$TAR_FILE" "$DOWNLOAD_URL"
else
  echo "==> Archivo ${TAR_FILE} ya existe localmente. Omitiendo descarga."
fi

# 3. Extraer solo el ejecutable 'vector'
echo "==> Extrayendo ejecutable 'vector'..."
tar -xzf "$TAR_FILE" --strip-components=3 -C "$TEMP_DIR" "./vector-x86_64-unknown-linux-musl/bin/vector"

# 4. Copiar archivos de configuración e instalación
echo "==> Copiando scripts de configuración..."
cp vector.toml "$TEMP_DIR/"
cp deploy_offline.sh "$TEMP_DIR/"

# 5. Comprimir el bundle final
echo "==> Generando archivo unificado ${BUNDLE_NAME}..."
tar -czf "$BUNDLE_NAME" -C "$TEMP_DIR" vector vector.toml deploy_offline.sh

# 6. Limpieza
echo "==> Limpiando archivos temporales..."
rm -rf "$TEMP_DIR"

echo "========================================================================"
echo "✔ ¡Éxito! Bundle generado: ${BUNDLE_NAME}"
echo "Transfiere este archivo a tu servidor QA/PROD y ejecuta 'deploy_offline.sh'"
echo "========================================================================"
