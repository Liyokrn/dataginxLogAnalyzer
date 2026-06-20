"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Server,
  Terminal,
  Waypoints,
  Settings,
  ChevronDown,
  Box
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Log Console", href: "/logs", icon: Terminal },
  { name: "Infrastructure", href: "/infrastructure", icon: Server },
  { name: "Pipeline Editor", href: "/pipeline", icon: Waypoints },
]

const modules = [
  { name: "Auth Service", href: "/modules/auth", status: "ok" },
  { name: "Payment Gateway", href: "/modules/payment", status: "warn" },
  { name: "User API", href: "/modules/user", status: "ok" },
  { name: "Inventory", href: "/modules/inventory", status: "critical" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-(--border) bg-(--card)">
      {/* Project Dropdown & Env Switch placeholder */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-(--border)">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
            L
          </div>
          <span className="text-sm">LogAnalyzer</span>
          <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
        </div>
        <div className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-900/50 text-blue-400 border border-blue-800">
          PROD
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-(--accent) text-(--foreground)"
                    : "text-gray-400 hover:bg-(--accent)/50 hover:text-(--foreground)",
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Extracted Modules
          </h3>
          <div className="mt-2 space-y-1 px-2">
            {modules.map((module) => {
              const isActive = pathname === module.href
              return (
                <Link
                  key={module.name}
                  href={module.href}
                  className={cn(
                    isActive
                      ? "bg-(--accent) text-(--foreground)"
                      : "text-gray-400 hover:bg-(--accent)/50 hover:text-(--foreground)",
                    "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors"
                  )}
                >
                  <div className="flex items-center">
                    <Box className="mr-3 h-4 w-4 text-gray-500" />
                    {module.name}
                  </div>
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      module.status === "ok" && "bg-(--status-ok)",
                      module.status === "warn" && "bg-(--status-warn)",
                      module.status === "critical" && "bg-(--status-critical)"
                    )}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-(--border) p-4">
        <button className="flex w-full items-center text-sm font-medium text-gray-400 hover:text-(--foreground) transition-colors">
          <Settings className="mr-3 h-5 w-5 text-gray-500" />
          Settings
        </button>
      </div>
    </div>
  )
}
