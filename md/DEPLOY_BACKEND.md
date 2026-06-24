# Guía de Despliegue del Backend en el Servidor SonarQube

Esta guía describe los pasos para desplegar el Backend y la base de datos ClickHouse de LogAnalyzer en el Servidor SonarQube, que ya existe en nuestra red interna.

## 1. Requisitos Previos

- Acceso por SSH al Servidor SonarQube.
- Docker y Docker Compose instalados en el servidor.
- Confirmar que los puertos `3001` (Backend), `8123` y `9000` (ClickHouse) no estén siendo utilizados por otros contenedores o servicios del servidor SonarQube.

## 2. Preparar el Entorno

1. Clona o actualiza el repositorio en el Servidor SonarQube:
   ```bash
   git clone <URL_DEL_REPO> /opt/loganalyzer
   cd /opt/loganalyzer
   ```

2. Configura las variables de entorno. Crea un archivo `.env` en la raíz del proyecto (o utiliza los valores desde tu CI/CD):
   ```env
   CLICKHOUSE_USER=tu_usuario
   CLICKHOUSE_PASSWORD=tu_password
   CLICKHOUSE_DB=loganalyzer
   FRONTEND_API_KEY=tu_clave_secreta_frontend
   INGEST_API_KEY=tu_clave_secreta_ingesta
   ```

## 3. Desplegar los Servicios

Asegúrate de estar en el directorio raíz del proyecto y ejecuta:

```bash
docker-compose -f docker-compose.backend.yml up -d --build
```

Esto levantará los contenedores de manera que sus puertos queden expuestos a la red interna (`0.0.0.0`):
- `loganalyzer_clickhouse` en los puertos `8123` y `9000`.
- `loganalyzer_backend` en el puerto `3001`.

## 4. Verificación

1. Comprueba que los contenedores estén corriendo y saludables sin interferir con otros:
   ```bash
   docker ps | grep loganalyzer
   ```

2. Revisa los logs para asegurar que no hay conflictos de conexión ni errores de inicio:
   ```bash
   docker logs loganalyzer_backend
   docker logs loganalyzer_clickhouse
   ```

3. Verifica la conexión a ClickHouse (Puerto 8123):
   ```bash
   curl "http://localhost:8123/?query=SELECT%201"
   # Debería retornar un "1" si la base de datos está respondiendo.
   ```

4. Verifica que la API del backend esté respondiendo (Puerto 3001):
   ```bash
   curl -X GET "http://localhost:3001/api/health"
   # (Asumiendo que cuentas con un endpoint /api/health para monitoreo).
   ```

## 5. Configurar los Agentes (QA / PROD)

En los nodos de QA y PROD que envían datos mediante Vector, asegúrate de proveer la nueva IP interna:

```bash
export BACKEND_INTERNAL_IP=<IP_INTERNA_SONARQUBE>
# Luego reinicia o despliega Vector en los agentes.
```
