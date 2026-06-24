#!/usr/bin/env bash
# ============================================================================
# check_ports.sh - Verificación de puertos para LogAnalyzer
# Servidor: 10.100.225.249 (SonarQube / LogAnalyzer Central)
# Usuario: ly
#
# Uso: chmod +x check_ports.sh && ./check_ports.sh
# ============================================================================

set -euo pipefail

# ── Colores ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Puertos a verificar ─────────────────────────────────────────────────────
declare -A PORT_DESCRIPTIONS=(
  [3000]="LogAnalyzer Frontend (Next.js)"
  [3001]="LogAnalyzer Backend API (Fastify)"
  [8123]="ClickHouse HTTP Interface"
  [9001]="ClickHouse Native TCP Interface (remapeado, SonarQube usa 9000)"
)

PORTS_TO_CHECK=(3000 3001 8123 9001)

# ── Funciones ────────────────────────────────────────────────────────────────
print_header() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}LogAnalyzer - Verificación de Puertos${NC}                       ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  Servidor: $(hostname) ($(hostname -I 2>/dev/null | awk '{print $1}' || echo 'N/A'))        ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  Fecha:    $(date '+%Y-%m-%d %H:%M:%S')                          ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

check_port() {
  local port=$1
  local description=${PORT_DESCRIPTIONS[$port]}
  local process_info

  # Intentar obtener información del proceso que usa el puerto
  process_info=$(ss -tlnp "sport = :${port}" 2>/dev/null | grep -v "^State" || true)

  if [ -z "$process_info" ]; then
    # Puerto libre
    echo -e "  ${GREEN}✔ Puerto ${BOLD}${port}${NC}${GREEN} LIBRE${NC}  →  ${description}"
    return 0
  else
    # Puerto ocupado - extraer detalles del proceso
    local process_name
    process_name=$(echo "$process_info" | grep -oP 'users:\(\("\K[^"]+' || echo "desconocido")
    local pid
    pid=$(echo "$process_info" | grep -oP 'pid=\K[0-9]+' || echo "N/A")

    echo -e "  ${RED}✘ Puerto ${BOLD}${port}${NC}${RED} OCUPADO${NC} →  ${description}"
    echo -e "    ${YELLOW}├─ Proceso: ${process_name}${NC}"
    echo -e "    ${YELLOW}├─ PID:     ${pid}${NC}"
    echo -e "    ${YELLOW}└─ Detalle: $(echo "$process_info" | head -1 | awk '{print $1, $4}')${NC}"
    return 1
  fi
}

# ── Ejecución Principal ─────────────────────────────────────────────────────
print_header

echo -e "${BOLD}Verificando puertos requeridos por LogAnalyzer...${NC}"
echo ""

blocked=0

for port in "${PORTS_TO_CHECK[@]}"; do
  if ! check_port "$port"; then
    blocked=$((blocked + 1))
  fi
done

echo ""
echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"

if [ "$blocked" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✔ RESULTADO: Todos los puertos están libres.${NC}"
  echo -e "  ${GREEN}  Puedes proceder con: docker compose -f docker-compose.backend.yml up -d --build${NC}"
else
  echo -e "  ${RED}${BOLD}✘ RESULTADO: ${blocked} puerto(s) ocupado(s).${NC}"
  echo -e "  ${YELLOW}  Detén los procesos que ocupan esos puertos antes de desplegar.${NC}"
  echo -e "  ${YELLOW}  Tip: docker ps | grep -E '(3001|8123|9000)' para ver contenedores.${NC}"
fi

echo ""
exit $blocked
