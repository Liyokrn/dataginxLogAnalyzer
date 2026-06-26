"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react"
import { MOCK_ROLE } from "@/lib/auth"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [envOpen, setEnvOpen] = React.useState(false)
  const [currentEnv, setCurrentEnv] = React.useState("PROD")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-(--border) bg-(--card) px-6">
      <div className="flex items-center gap-6">
        {/* Environment Selector */}
        <div className="relative">
          <button 
            onClick={() => setEnvOpen(!envOpen)}
            className="flex items-center gap-2 rounded-md bg-(--accent) px-3 py-1.5 text-sm font-medium border border-(--border) hover:bg-(--accent)/80 transition-colors"
          >
            <span className="text-gray-400">Ambiente:</span>
            <span>{currentEnv}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {envOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 rounded-md border border-(--border) bg-(--card) py-1 shadow-lg z-50">
              <button
                onClick={() => { setCurrentEnv("PROD"); setEnvOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-(--accent) flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> PROD
              </button>
              <button
                onClick={() => { setCurrentEnv("QA"); setEnvOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-(--accent) flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" /> QA
              </button>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-(--border)" aria-hidden="true" />

        {/* Search */}
        <div className="relative w-64 md:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-(--border) bg-(--background) py-1.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-gray-500 focus:outline-none"
            placeholder="Buscar..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-(--foreground) transition-colors">
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-(--status-critical)" />
          <Bell className="h-4 w-4" />
        </button>
        
        <div className="h-6 w-px bg-(--border)" aria-hidden="true" />
        
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full p-1 text-gray-400 hover:text-(--foreground) transition-colors focus:outline-none"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        <div className="h-7 w-7 rounded-full bg-(--accent) flex items-center justify-center text-xs font-medium border border-(--border)">
          {MOCK_ROLE === "ADMIN" ? "AD" : "US"}
        </div>
      </div>
    </header>
  )
}
