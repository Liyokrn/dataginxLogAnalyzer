"use client"

import * as React from "react"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0d1117] overflow-hidden px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161b22_1px,transparent_1px),linear-gradient(to_bottom,#161b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#161b22]/40 backdrop-blur-xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-white/10">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Logo container with pulse animation */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#21262d] border border-[#30363d] shadow-lg group">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <svg 
              className="h-9 w-9 text-blue-500 transition-transform duration-300 group-hover:scale-110" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              LogAnalyzer
            </h1>
            <p className="text-sm text-gray-400">
              Plataforma centralizada de observabilidad
            </p>
          </div>

          <div className="w-full pt-4 border-t border-[#30363d]/50">
            <button 
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-[#e24329] to-[#fc6d26] text-white font-medium shadow-lg hover:shadow-orange-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              {/* GitLab fox logo custom SVG */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 13.072l-1.077-3.31a.916.916 0 0 0-.324-.445.918.918 0 0 0-.533-.122h-.008L18.4 9.176l-2.483-7.643a.925.925 0 0 0-1.748.006L11.7 9.176H6.182L3.7 9.195a.918.918 0 0 0-.533.122.916.916 0 0 0-.324.445l-1.077 3.31a.914.914 0 0 0 .324 1.01l9.645 7.009h.001c.162.119.356.182.555.182a.919.919 0 0 0 .556-.182l9.645-7.009a.916.916 0 0 0 .324-1.01z" />
              </svg>
              <span>Iniciar Sesión con GitLab</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer copyright */}
      <div className="absolute bottom-6 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} LogAnalyzer. Todos los derechos reservados.
      </div>
    </div>
  )
}
