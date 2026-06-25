"use client"

import * as React from "react"
import { Cpu, Server, HardDrive, Network } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
          <Cpu className="h-4 w-4" /> Hardware
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Recursos de Servidores</h1>
        <p className="text-sm text-gray-400">
          Métricas de hardware y consumo de recursos de los servidores QA y PROD en tiempo real.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">CPU & Load</h3>
            <Cpu className="h-5 w-5 text-blue-400" />
          </div>
          <div className="h-20 flex items-center justify-center border border-dashed border-[#30363d] rounded-lg text-gray-500 text-xs">
            Awaiting Vector CPU metrics...
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Memoria RAM</h3>
            <Server className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="h-20 flex items-center justify-center border border-dashed border-[#30363d] rounded-lg text-gray-500 text-xs">
            Awaiting Vector RAM metrics...
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Disco & E/S</h3>
            <HardDrive className="h-5 w-5 text-purple-400" />
          </div>
          <div className="h-20 flex items-center justify-center border border-dashed border-[#30363d] rounded-lg text-gray-500 text-xs">
            Awaiting Vector Disk metrics...
          </div>
        </div>
      </div>
    </div>
  )
}
