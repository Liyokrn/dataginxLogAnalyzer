"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Search, Bell, Sun, Moon } from "lucide-react"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-(--border) bg-(--card)/80 backdrop-blur px-6">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-(--border) bg-(--background) py-1.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search logs, modules, or use KQL/Regex..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-(--foreground) transition-colors">
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-(--status-critical) ring-2 ring-(--card)" />
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="h-6 w-px bg-(--border)" aria-hidden="true" />
        
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full p-1 text-gray-400 hover:text-(--foreground) transition-colors focus:outline-none"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>

        <div className="h-8 w-8 rounded-full bg-(--accent) flex items-center justify-center text-sm font-medium border border-(--border)">
          AD
        </div>
      </div>
    </header>
  )
}
