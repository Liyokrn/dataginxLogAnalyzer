"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Server, Activity, ArrowRight, LayoutTemplate } from "lucide-react"
import { MOCK_ROLE } from "@/lib/auth"
import { cn } from "@/lib/utils"

const MOCK_NODES = [
  { id: 1, name: "dataginx-api-1", rss: "45%", status: "ok" },
  { id: 2, name: "dataginx-api-2", rss: "52%", status: "ok" },
  { id: 3, name: "dataginx-worker-1", rss: "88%", status: "warn" },
  { id: 4, name: "dataginx-db-1", rss: "60%", status: "ok" },
]

export default function OverviewPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-(--foreground)">Inicio</h1>
        <p className="text-sm text-gray-400">
          Bienvenido a LogAnalyzer. Selecciona un acceso rápido o revisa el estado de tu infraestructura.
        </p>
      </div>

      {MOCK_ROLE === 'ADMIN' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
            <Activity className="h-4 w-4" />
            <h2>Estado de Nodos (PROD)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_NODES.map(node => (
              <div key={node.id} className="rounded-md border border-(--border) bg-(--card) p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">{node.name}</span>
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    node.status === 'ok' ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-(--foreground)">RSS: {node.rss}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-(--foreground)">Accesos Rápidos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          
          <Link href="/logs/nginx" className="group rounded-md border border-(--border) bg-(--card) p-5 flex flex-col gap-4 hover:border-gray-500 transition-colors">
            <div className="h-10 w-10 rounded-md bg-(--accent) flex items-center justify-center text-(--foreground) border border-(--border)">
              🔍
            </div>
            <div>
              <h3 className="text-sm font-medium text-(--foreground) mb-1 group-hover:text-emerald-500 transition-colors">Buscar en Nginx</h3>
              <p className="text-xs text-gray-400">Accede directamente a los logs del servidor web Nginx.</p>
            </div>
          </Link>

          <Link href="/logs/php" className="group rounded-md border border-(--border) bg-(--card) p-5 flex flex-col gap-4 hover:border-gray-500 transition-colors">
            <div className="h-10 w-10 rounded-md bg-(--accent) flex items-center justify-center text-(--foreground) border border-(--border)">
              🐘
            </div>
            <div>
              <h3 className="text-sm font-medium text-(--foreground) mb-1 group-hover:text-blue-500 transition-colors">Ver errores de PHP</h3>
              <p className="text-xs text-gray-400">Revisa trazas y errores de la aplicación PHP-FPM.</p>
            </div>
          </Link>

          <Link href="/logs/web" className="group rounded-md border border-(--border) bg-(--card) p-5 flex flex-col gap-4 hover:border-gray-500 transition-colors">
            <div className="h-10 w-10 rounded-md bg-(--accent) flex items-center justify-center text-(--foreground) border border-(--border)">
              🏢
            </div>
            <div>
              <h3 className="text-sm font-medium text-(--foreground) mb-1 group-hover:text-amber-500 transition-colors">Ir a Módulo Nómina</h3>
              <p className="text-xs text-gray-400">Filtros predefinidos para analizar el módulo de nómina.</p>
            </div>
          </Link>

        </div>
      </section>
    </div>
  )
}
