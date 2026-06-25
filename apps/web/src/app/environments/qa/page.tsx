"use client"

import * as React from "react"
import { Globe, Server, Activity } from "lucide-react"

export default function QAEnvironmentPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-green-500 uppercase tracking-wider">
          <Globe className="h-4 w-4" /> Ambientes
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Ambiente QA</h1>
        <p className="text-sm text-gray-400">
          Servidores de pruebas y pre-producción (Quality Assurance).
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] mt-8">
        <div className="p-4 rounded-full bg-green-500/10 text-green-400 mb-4 animate-pulse">
          <Server className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Monitoreo de Servidores QA</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Los logs de Nginx y PHP provenientes del ambiente de QA están siendo recolectados por los agentes Vector locales. Puedes visualizarlos en la Consola de Logs.
        </p>
      </div>
    </div>
  )
}
