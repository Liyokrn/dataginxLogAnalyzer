"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Globe,
  Search,
  Cpu,
  Box,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  FileText,
  Bot
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  
  // Track dropdown expansion state
  const [environmentsOpen, setEnvironmentsOpen] = React.useState(true)
  const [configOpen, setConfigOpen] = React.useState(true)

  // Quick helper to see if pathname is active
  const isLinkActive = (href: string) => pathname === href

  // Quick helper to check if a group has any active sub-link
  const isGroupActive = (hrefs: string[]) => hrefs.includes(pathname)

  return (
    <div className="flex h-full w-64 flex-col border-r border-(--border) bg-(--card) select-none">
      {/* Header / Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-(--border)">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
          LA
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight text-white">LogAnalyzer</span>
          <span className="text-[10px] text-gray-500 font-mono">v1.2.0 (QA/PROD)</span>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <div>
          <h3 className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Observabilidad
          </h3>
          <div className="space-y-1">
            {/* Inicio (Overview) */}
            <Link
              href="/overview"
              className={cn(
                isLinkActive("/overview")
                  ? "bg-(--accent) text-white font-medium"
                  : "text-gray-400 hover:bg-(--accent)/50 hover:text-white",
                "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              )}
            >
              <Home
                className={cn(
                  isLinkActive("/overview") ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                  "mr-3 h-4.5 w-4.5 flex-shrink-0 transition-colors"
                )}
              />
              Inicio
            </Link>

            {/* Ambientes (Dropdown) */}
            <div className="space-y-1">
              <button
                onClick={() => setEnvironmentsOpen(!environmentsOpen)}
                className={cn(
                  isGroupActive(["/environments/qa", "/environments/prod"])
                    ? "text-white"
                    : "text-gray-400 hover:bg-(--accent)/30 hover:text-white",
                  "w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer"
                )}
              >
                <div className="flex items-center">
                  <Globe
                    className={cn(
                      isGroupActive(["/environments/qa", "/environments/prod"]) ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                      "mr-3 h-4.5 w-4.5 flex-shrink-0"
                    )}
                  />
                  <span>Ambientes</span>
                </div>
                {environmentsOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {environmentsOpen && (
                <div className="pl-6 space-y-1 border-l border-(--border) ml-5 mt-1">
                  <Link
                    href="/environments/qa"
                    className={cn(
                      isLinkActive("/environments/qa")
                        ? "text-blue-500 font-medium"
                        : "text-gray-500 hover:text-white",
                      "group flex items-center rounded-md px-3 py-2 text-xs transition-colors"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2.5" />
                    QA Environment
                  </Link>
                  <Link
                    href="/environments/prod"
                    className={cn(
                      isLinkActive("/environments/prod")
                        ? "text-blue-500 font-medium"
                        : "text-gray-500 hover:text-white",
                      "group flex items-center rounded-md px-3 py-2 text-xs transition-colors"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2.5" />
                    PROD Environment
                  </Link>
                </div>
              )}
            </div>

            {/* Logs Generales */}
            <Link
              href="/logs"
              className={cn(
                isLinkActive("/logs")
                  ? "bg-(--accent) text-white font-medium"
                  : "text-gray-400 hover:bg-(--accent)/50 hover:text-white",
                "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              )}
            >
              <Search
                className={cn(
                  isLinkActive("/logs") ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                  "mr-3 h-4.5 w-4.5 flex-shrink-0 transition-colors"
                )}
              />
              Logs Generales
            </Link>

            {/* Recursos de Servidores */}
            <Link
              href="/resources"
              className={cn(
                isLinkActive("/resources")
                  ? "bg-(--accent) text-white font-medium"
                  : "text-gray-400 hover:bg-(--accent)/50 hover:text-white",
                "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              )}
            >
              <Cpu
                className={cn(
                  isLinkActive("/resources") ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                  "mr-3 h-4.5 w-4.5 flex-shrink-0 transition-colors"
                )}
              />
              Recursos de Servidores
            </Link>

            {/* Sistema y Docker */}
            <Link
              href="/system"
              className={cn(
                isLinkActive("/system")
                  ? "bg-(--accent) text-white font-medium"
                  : "text-gray-400 hover:bg-(--accent)/50 hover:text-white",
                "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              )}
            >
              <Box
                className={cn(
                  isLinkActive("/system") ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                  "mr-3 h-4.5 w-4.5 flex-shrink-0 transition-colors"
                )}
              />
              Sistema y Docker
            </Link>
          </div>
        </div>

        {/* Configuration Segment */}
        <div>
          <h3 className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Administración
          </h3>
          <div className="space-y-1">
            {/* Configuración (Dropdown for Rules and Agents) */}
            <div className="space-y-1">
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className={cn(
                  isGroupActive(["/pipeline", "/agents"])
                    ? "text-white"
                    : "text-gray-400 hover:bg-(--accent)/30 hover:text-white",
                  "w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer"
                )}
              >
                <div className="flex items-center">
                  <Settings
                    className={cn(
                      isGroupActive(["/pipeline", "/agents"]) ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300",
                      "mr-3 h-4.5 w-4.5 flex-shrink-0"
                    )}
                  />
                  <span>Configuración</span>
                </div>
                {configOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {configOpen && (
                <div className="pl-6 space-y-1 border-l border-(--border) ml-5 mt-1">
                  <Link
                    href="/pipeline"
                    className={cn(
                      isLinkActive("/pipeline")
                        ? "text-blue-500 font-medium"
                        : "text-gray-500 hover:text-white",
                      "group flex items-center rounded-md px-3 py-2 text-xs transition-colors"
                    )}
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    Reglas de Parseo
                  </Link>
                  <Link
                    href="/agents"
                    className={cn(
                      isLinkActive("/agents")
                        ? "text-blue-500 font-medium"
                        : "text-gray-500 hover:text-white",
                      "group flex items-center rounded-md px-3 py-2 text-xs transition-colors"
                    )}
                  >
                    <Bot className="mr-2 h-3.5 w-3.5" />
                    Agentes Activos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Current Session Info */}
      <div className="border-t border-(--border) p-4 flex items-center gap-3 bg-(--background)/30">
        <div className="h-8 w-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-800/40">
          U
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-gray-300 truncate">Usuario QA</span>
          <span className="text-[10px] text-gray-500 truncate">gitlab-sync@loganalyzer</span>
        </div>
      </div>
    </div>
  )
}
