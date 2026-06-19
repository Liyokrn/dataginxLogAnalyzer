"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [isLightMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-card rounded-xl border border-border p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative thin top indicator */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-ok via-warn to-critical opacity-60" />

        {/* Header bar */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">LogAnalyzer</h1>
            <p className="text-sm opacity-60">Observability & Log Processing Platform</p>
          </div>
          
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="px-4 py-2 rounded-xl bg-accent-bg text-accent-fg hover:opacity-85 text-xs font-medium border border-border transition-all cursor-pointer"
          >
            Switch to {isLightMode ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {/* Demo grid showing the color palette */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-accent-bg border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-2 opacity-80">Design System</h2>
            <p className="text-xs opacity-65 leading-relaxed">
              Minimalist iOS-style aesthetic with fine 1px dividers, soft 12px corners, and premium dark/light HSL palettes.
            </p>
          </div>

          <div className="bg-accent-bg border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-2 opacity-80">Tech Stack</h2>
            <p className="text-xs opacity-65 leading-relaxed">
              Scaffolded with Next.js, React, Tailwind CSS v4, and pnpm. Designed for sub-second log rendering.
            </p>
          </div>

          <div className="bg-accent-bg border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-2 opacity-80">Platform Status</h2>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-ok" />
                <span>Ingestion Pipeline: OK</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-warn" />
                <span>PHP Wildcards: Warn (Pending)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-critical" />
                <span>Kubernetes Discovery: Error (Scaffold Phase)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mononspace Console Preview */}
        <div className="bg-[#05080F] border border-border rounded-xl p-6 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2 opacity-50 text-xs">
            <span>console.log</span>
            <span>systemd-journal</span>
          </div>
          <div className="space-y-1">
            <p className="text-ok/90">[2026-06-19 15:46:05] [INFO] Starting LogAnalyzer agent ingestion daemon...</p>
            <p className="text-[#A5B4FC]">{"[2026-06-19 15:46:06] [DEBUG] Matching Nginx paths on pattern `/var/www/({modulo})`"}</p>
            <p className="text-warn/90">[2026-06-19 15:46:07] [WARN] Found concurrent PHP installations: PHP 7.4, 8.2, 8.4</p>
            <p className="text-ok/90">[2026-06-19 15:46:08] [INFO] Watching wildcard php*-fpm.log logs successfully.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
