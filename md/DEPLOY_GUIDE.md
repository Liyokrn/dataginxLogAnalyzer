# 🚀 LogAnalyzer — Manual de Operaciones y Despliegue

> **Arquitectura**: Red privada 100%. Sin Jump PC ni acceso público. Todo el stack corriendo en el servidor central (incluido el Frontend en el puerto 3000).

## Topología de Red

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RED INTERNA (VPN)                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐               │
│  │  SERVIDOR CENTRAL (SonarQube)                    │               │
│  │  IP: 10.100.225.249  │  Usuario SSH: ly   contraseña: 135513     │
│  │                                                  │               │
│  │  ┌─────────────────┐  ┌───────────────────────┐  │               │
│  │  │  ClickHouse     │  │ Backend API (Fastify) │  │               │
│  │  │  :8123 (HTTP)   │  │  :3001                │  │               │
│  │  │  :9001 (TCP)*   │  │                       │  │               │
│  │  └─────────────────┘  └───────────────────────┘  │               │
│  │  ┌─────────────────┐                             │               │
│  │  │ Frontend Next.js│                             │               │
│  │  │  :3000 (HTTP)   │                             │               │
│  │  └─────────────────┘                             │               │
│  └──────────────────────────────────────────────────┘               │
│          ▲                         ▲                                │
│          │ logs (Vector)           │ HTTP (:3000) / WS (:3001)      │
│  ┌───────┴───────┐         ┌──────┴──────────┐                      │
│  │ Agentes       │         │ PCs del equipo  │                      │
│  │ QA / PROD     │         │ (Navegador Web) │                      │
│  │ (Vector)      │         │ via VPN         │                      │
│  └───────────────┘         └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Paso 1 — Construir y Guardar la Imagen del Frontend (En tu PC Local)

Dado que el servidor no cuenta con conexión a internet para descargar dependencias de npm, debemos construir y empaquetar la imagen de Next.js localmente antes de transferirla.

Ejecuta en la raíz del repositorio de tu PC local:

```bash
# 1. Construir la imagen del frontend con la IP del servidor configurada para websockets
docker build --build-arg NEXT_PUBLIC_WS_URL=ws://10.100.225.249:3001/ws -t loganalyzer-frontend:latest -f apps/web/Dockerfile .

# 2. Exportar la imagen construida a un archivo .tar
docker save loganalyzer-frontend:latest -o loganalyzer-frontend.tar
```

---

## Paso 2 — Subir archivos e imagen al servidor

Desde tu PC local (con la VPN conectada), ejecuta:

```bash
# Subir la imagen tar del frontend y archivos de configuración
scp loganalyzer-frontend.tar \
    docker-compose.yml \
    .env \
    agent-config/check_ports.sh \
    backend/init_db.sql \
    ly@10.100.225.249:/tmp/
```

> [!NOTE]
> Asegúrate de tener un archivo `.env` configurado con las credenciales reales en tu PC local antes de subirlo.

---

## Paso 3 — Importar la imagen en el servidor

Conéctate vía SSH al servidor `10.100.225.249` y carga la imagen en Docker:

```bash
# Conectar por SSH
ssh ly@10.100.225.249

# Cargar la imagen del frontend en Docker y limpiar el archivo temporal
docker load -i /tmp/loganalyzer-frontend.tar
rm /tmp/loganalyzer-frontend.tar
```

---

## Paso 4 — Configurar directorio de despliegue y verificar puertos

En la sesión SSH del servidor, organiza los archivos en `/opt/loganalyzer` y ejecuta el diagnóstico de puertos:

```bash
# Crear estructura de directorios
sudo mkdir -p /opt/loganalyzer
sudo cp /tmp/docker-compose.yml /tmp/.env /tmp/init_db.sql /opt/loganalyzer/
sudo mkdir -p /opt/loganalyzer/backend
sudo mv /opt/loganalyzer/init_db.sql /opt/loganalyzer/backend/
sudo cp /tmp/check_ports.sh /opt/loganalyzer/
cd /opt/loganalyzer

# Dar permisos y ejecutar verificación
chmod +x check_ports.sh
./check_ports.sh
```

**Resultados esperados:**

| Puerto | Servicio | Estado esperado |
|--------|----------|----------------|
| `80`   | Frontend Next.js | 🟢 LIBRE |
| `3001` | Backend API (Fastify) | 🟢 LIBRE |
| `8123` | ClickHouse HTTP | 🟢 LIBRE |
| `9001` | ClickHouse Native TCP (remapeado) | 🟢 LIBRE |

> [!WARNING]
> Si el puerto `80` u otro está ocupado, detén el contenedor o proceso correspondiente antes de continuar.

---

## Paso 5 — Levantar todo el stack en el servidor

```bash
cd /opt/loganalyzer

# Iniciar los servicios (ClickHouse, Backend y Frontend) en segundo plano
docker compose up -d --build
```

### Verificar que todo está corriendo

```bash
docker ps --filter "name=loganalyzer"
```

Deberías ver:

| Contenedor | Puerto | Estado |
|-----------|--------|--------|
| `loganalyzer_frontend` | `0.0.0.0:3000→3000` | Up |
| `loganalyzer_backend` | `0.0.0.0:3001→3001` | Up (healthy) |
| `loganalyzer_clickhouse` | `0.0.0.0:8123`, `0.0.0.0:9001→9000` | Up (healthy) |

### Probar accesibilidad

1. **Desde cualquier PC en la VPN**: Entrar a **`http://10.100.225.249:3000/`** para ver el Dashboard de Next.js.
2. **Backend API responde**: `curl http://localhost:3001/api/health`
3. **ClickHouse responde**: `curl "http://localhost:8123/?query=SELECT%201"`

---

## Operaciones Comunes

### Reiniciar el stack completo o un servicio

```bash
docker compose restart          # Todo el stack
docker compose restart log-frontend  # Solo el frontend
```

### Ver logs en tiempo real

```bash
docker compose logs -f
```

### Detener los servicios

```bash
docker compose down
```

> [!CAUTION]
> No uses el flag `-v` a menos que quieras destruir completamente la base de datos ClickHouse y todos los logs históricos almacenados.
