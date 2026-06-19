# LogAnalyzer

Centralized Observability & Log Processing Platform. Designed for managing logs and hardware metrics (CPU, RAM, Net, Disk) across 20-30 servers in hybrid environments (Linux, Windows, Kubernetes, Docker).

## 🚀 Requisitos Previos

- **Node.js**: `v24` o superior recomendado.
- **pnpm**: `v11` o superior.

## 🛠️ Estructura del Monorepo

- `apps/web`: Aplicación principal en **Next.js** (React, TypeScript, Tailwind CSS v4) que sirve tanto la interfaz de usuario como las APIs de ingestión.
- `packages/agent-config`: Plantillas y configuraciones para agentes de recolección de logs (Fluent Bit, Vector, Promtail).

## 💻 Comandos de Desarrollo

Primero, instala todas las dependencias del monorepo desde la raíz:

```bash
pnpm install
```

### Ejecutar en Entorno de Desarrollo
Para levantar el servidor de desarrollo de la interfaz de usuario (Next.js):

```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Compilar para Producción
Para generar el build optimizado de todos los proyectos en el monorepo:

```bash
pnpm build
```

---

## 🎨 Sistema de Diseño (Estilo Apple iOS)
La interfaz del frontend utiliza una paleta de colores minimalista y elegante:
- **Fondo Base (Dark Mode):** Deep Midnight Blue (`#0A0E17`)
- **Tarjetas y Superficies:** Navy (`#111827`)
- **Texto Principal:** Pearl White / Soft Ivory (`#EAE6DF`)
- **Acentos:** Subdued Dark Blue (`#161F30`)
