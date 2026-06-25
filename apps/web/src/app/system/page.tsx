"use client"

import * as React from "react"
import { Box, Play, Terminal } from "lucide-react"

export default function SystemDockerPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
          <Box className="h-4 w-4" /> Sistema
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Sistema y Docker</h1>
        <p className="text-sm text-gray-400">
          Supervisión de contenedores Docker y logs de bajo nivel del sistema operativo.
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] mt-8">
        <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 mb-4 animate-pulse">
          <Terminal className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Contenedores y Logs del Sistema</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Consola integrada de Docker daemon y logs syslogs/journald. Aún no se han configurado streams de Vector para estos servicios.
        </p>
      </div>
    </div>
  )
}
