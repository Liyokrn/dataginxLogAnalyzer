"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  Server,
  ChevronDown,
  ChevronRight,
  TerminalSquare,
  Activity,
  Box
} from "lucide-react"
import { MOCK_ROLE } from "@/lib/auth"

export function Sidebar() {
  const pathname = usePathname()
  
  const [logsOpen, setLogsOpen] = React.useState(true)
  const [infraOpen, setInfraOpen] = React.useState(true)

  const isLinkActive = (href: string) => pathname === href
  const isGroupActive = (hrefs: string[]) => hrefs.some(href => pathname.startsWith(href))

  return (
    <div className="flex h-full w-64 flex-col border-r border-(--border) bg-(--card) select-none">
      {/* Header / Brand */}
      <div className="flex h-14 items-center gap-3 px-6 border-b border-(--border)">
        <div className="h-7 w-7 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-100 font-bold border border-zinc-700">
          LA
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight text-(--foreground)">LogAnalyzer</span>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        
        {/* Inicio */}
        <div>
          <Link
            href="/overview"
            className={cn(
              isLinkActive("/overview")
                ? "bg-(--accent) text-(--foreground) font-medium"
                : "text-gray-400 hover:bg-(--accent)/50 hover:text-(--foreground)",
              "group flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200"
            )}
          >
            <Home
              className={cn(
                isLinkActive("/overview") ? "text-(--foreground)" : "text-gray-500 group-hover:text-gray-400",
                "mr-3 h-4 w-4 flex-shrink-0 transition-colors"
              )}
            />
            Inicio
          </Link>
        </div>

        {/* Explorador de Logs */}
        <div className="space-y-1">
          <button
            onClick={() => setLogsOpen(!logsOpen)}
            className={cn(
              isGroupActive(["/logs"]) && !isLinkActive("/overview")
                ? "text-(--foreground)"
                : "text-gray-400 hover:text-(--foreground)",
              "w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer"
            )}
          >
            <div className="flex items-center">
              <TerminalSquare
                className={cn(
                  isGroupActive(["/logs"]) && !isLinkActive("/overview") ? "text-(--foreground)" : "text-gray-500 group-hover:text-gray-400",
                  "mr-3 h-4 w-4 flex-shrink-0"
                )}
              />
              <span className="font-medium">Explorador de Logs</span>
            </div>
            {logsOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {logsOpen && (
            <div className="pl-9 space-y-1 mt-1">
              <Link
                href="/logs/nginx"
                className={cn(
                  isLinkActive("/logs/nginx")
                    ? "text-(--foreground) font-medium bg-(--accent)/50"
                    : "text-gray-400 hover:text-(--foreground) hover:bg-(--accent)/30",
                  "group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
                )}
              >
                Nginx
              </Link>
              <Link
                href="/logs/php"
                className={cn(
                  isLinkActive("/logs/php")
                    ? "text-(--foreground) font-medium bg-(--accent)/50"
                    : "text-gray-400 hover:text-(--foreground) hover:bg-(--accent)/30",
                  "group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
                )}
              >
                PHP
              </Link>
              <Link
                href="/logs/web"
                className={cn(
                  isLinkActive("/logs/web")
                    ? "text-(--foreground) font-medium bg-(--accent)/50"
                    : "text-gray-400 hover:text-(--foreground) hover:bg-(--accent)/30",
                  "group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
                )}
              >
                Módulos Web
              </Link>
            </div>
          )}
        </div>

        {/* Infraestructura (Admin Only) */}
        {MOCK_ROLE === 'ADMIN' && (
          <div className="space-y-1">
            <button
              onClick={() => setInfraOpen(!infraOpen)}
              className={cn(
                isGroupActive(["/system"])
                  ? "text-(--foreground)"
                  : "text-gray-400 hover:text-(--foreground)",
                "w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer"
              )}
            >
              <div className="flex items-center">
                <Server
                  className={cn(
                    isGroupActive(["/system"]) ? "text-(--foreground)" : "text-gray-500 group-hover:text-gray-400",
                    "mr-3 h-4 w-4 flex-shrink-0"
                  )}
                />
                <span className="font-medium">Infraestructura</span>
              </div>
              {infraOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {infraOpen && (
              <div className="pl-9 space-y-1 mt-1">
                <Link
                  href="/system/nodes"
                  className={cn(
                    isLinkActive("/system/nodes")
                      ? "text-(--foreground) font-medium bg-(--accent)/50"
                      : "text-gray-400 hover:text-(--foreground) hover:bg-(--accent)/30",
                    "group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
                  )}
                >
                  <Activity className="mr-2 h-3.5 w-3.5" />
                  Estado de Nodos
                </Link>
                <Link
                  href="/system/docker"
                  className={cn(
                    isLinkActive("/system/docker")
                      ? "text-(--foreground) font-medium bg-(--accent)/50"
                      : "text-gray-400 hover:text-(--foreground) hover:bg-(--accent)/30",
                    "group flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
                  )}
                >
                  <Box className="mr-2 h-3.5 w-3.5" />
                  Docker
                </Link>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer / Current Session Info */}
      <div className="border-t border-(--border) p-3 flex items-center gap-3 bg-(--background)/50">
        <div className="h-8 w-8 rounded-full bg-(--accent) flex items-center justify-center font-medium text-xs border border-(--border)">
          {MOCK_ROLE === 'ADMIN' ? 'AD' : 'US'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-(--foreground) truncate">
            Usuario {MOCK_ROLE === 'ADMIN' ? 'Admin' : 'Regular'}
          </span>
          <span className="text-[10px] text-gray-500 truncate">{MOCK_ROLE.toLowerCase()}@loganalyzer</span>
        </div>
      </div>
    </div>
  )
}
