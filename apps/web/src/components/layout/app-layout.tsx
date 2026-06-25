"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Clean matching for authentication routes (login page and the empty login root shell)
  const isAuthPage = pathname === "/login" || pathname === "/"

  if (isAuthPage) {
    return (
      <main className="h-full w-full overflow-y-auto bg-(--background)">
        {children}
      </main>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-(--background) p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
