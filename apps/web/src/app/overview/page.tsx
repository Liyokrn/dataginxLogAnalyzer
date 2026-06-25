"use client"

import * as React from "react"
import { Home, ArrowRight, Play, Server, Layers } from "lucide-react"

export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
          <Home className="h-4 w-4" /> Observabilidad
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Inicio</h1>
        <p className="text-sm text-gray-400">
          Vista de bienvenida general de LogAnalyzer. Monitoriza el estado de tus servidores QA/PROD en tiempo real.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div>
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400 w-fit mb-4">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ambientes y Nodos</h3>
            <p className="text-sm text-gray-400">
              Visualiza y gestiona las métricas e instancias activas en los entornos de QA y PROD.
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors mt-6 w-fit cursor-pointer">
            Ver Ambientes <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Configuración de Reglas</h3>
            <p className="text-sm text-gray-400">
              Modifica los pipelines de parseo Regex y supervisa el estado de los agentes Vector locales.
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors mt-6 w-fit cursor-pointer">
            Ir a Configuración <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
