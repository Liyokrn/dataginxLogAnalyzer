"use client"

import * as React from "react"
import { Search, Filter, Play, Pause, ChevronRight, ChevronDown } from "lucide-react"
import { HistogramChart } from "@/components/HistogramChart"

const generateMockData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min))
}

const mockTimes = Array.from({ length: 40 }, (_, i) => `10:${i.toString().padStart(2, '0')}`)
const histogramData = generateMockData(40, 10, 100)

const initialMockLogs = [
  { id: 1, timestamp: "2026-06-19 15:46:05", level: "INFO", message: "Starting LogAnalyzer agent ingestion daemon...", source: "systemd-journal", metadata: { pid: 1450, host: "node-01" } },
  { id: 2, timestamp: "2026-06-19 15:46:06", level: "DEBUG", message: "Matching Nginx paths on pattern `/var/www/({modulo})`", source: "nginx", metadata: { request_id: "a1b2c3d4", ip: "192.168.1.10" } },
  { id: 3, timestamp: "2026-06-19 15:46:07", level: "WARN", message: "Found concurrent PHP installations: PHP 7.4, 8.2, 8.4", source: "php-fpm", metadata: { version: "8.2", pool: "www" } },
  { id: 4, timestamp: "2026-06-19 15:46:08", level: "INFO", message: "Watching wildcard php*-fpm.log logs successfully.", source: "agent", metadata: { file: "/var/log/php8.2-fpm.log" } },
  { id: 5, timestamp: "2026-06-19 15:46:12", level: "CRITICAL", message: "Database connection timeout (3000ms)", source: "auth-service", metadata: { db: "users", retries: 3 } },
]

export default function LogsPage() {
  const [isLive, setIsLive] = React.useState(true)
  const [expandedLog, setExpandedLog] = React.useState<number | string | null>(null)
  
  const [logs, setLogs] = React.useState<any[]>(initialMockLogs)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // Function to fetch from real backend
  const fetchLogs = async (searchQuery: string) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/logs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 100
        })
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      
      // Map ClickHouse schema to UI schema
      if (data && data.length > 0) {
        const mappedLogs = data.map((d: any) => ({
          id: d.log_id || Math.random().toString(),
          timestamp: new Date(d.timestamp).toISOString().replace('T', ' ').substring(0, 19),
          level: d.level,
          message: d.message,
          source: d.service_type,
          metadata: {
            project: d.project_id,
            env: d.env,
            node: d.source_node,
            extracted_module: d.extracted_module,
            ...d.dynamic_labels
          }
        }));
        setLogs(mappedLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error(err);
      // Fallback to empty or mock if backend is down
      setLogs([]); 
    } finally {
      setLoading(false)
    }
  }

  // Effect to trigger search when query changes (with debounce)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Log Console</h1>
        
        {/* Omnibox & Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-(--border) bg-(--card) py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder='modulo:nomina AND level:INFO'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-(--border) bg-(--card) px-4 py-2 text-sm font-medium hover:bg-(--accent)">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              isLive ? "bg-blue-900/20 border-blue-800 text-blue-400" : "border-(--border) bg-(--card) hover:bg-(--accent)"
            }`}
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* Timeline Histogram */}
      <div className="h-24 rounded-xl border border-(--border) bg-(--card) p-4 flex flex-col justify-end">
        <div className="flex-1 -mx-2 -mb-2">
          <HistogramChart data={histogramData} times={mockTimes} />
        </div>
      </div>

      {/* Terminal-style Log List */}
      <div className="flex-1 rounded-xl border border-(--border) bg-[#05080F] overflow-hidden flex flex-col shadow-inner">
        <div className="flex items-center justify-between border-b border-(--border) bg-[#0A0E17] px-4 py-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
          <div className="w-10"></div>
          <div className="w-40">Timestamp</div>
          <div className="w-24">Level</div>
          <div className="w-32">Source</div>
          <div className="flex-1">Message</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 font-mono text-sm leading-relaxed">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading logs from ClickHouse...</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No logs found matching query.</div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLog === log.id
              let levelColor = "text-gray-300"
              if (log.level === "INFO") levelColor = "text-(--status-ok)"
              if (log.level === "DEBUG") levelColor = "text-blue-400"
              if (log.level === "WARN") levelColor = "text-(--status-warn)"
              if (log.level === "CRITICAL" || log.level === "ERROR") levelColor = "text-(--status-critical)"

              return (
                <React.Fragment key={log.id}>
                  <div 
                    className="flex items-start py-1 px-2 hover:bg-white/5 cursor-pointer rounded group transition-colors"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="w-8 pt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div className="w-40 text-gray-500 flex-shrink-0">{log.timestamp}</div>
                    <div className={`w-24 font-bold ${levelColor} flex-shrink-0`}>{log.level}</div>
                    <div className="w-32 text-gray-400 flex-shrink-0">{log.source}</div>
                    <div className={`flex-1 break-all ${levelColor} opacity-90`}>{log.message}</div>
                  </div>
                  {isExpanded && (
                    <div className="ml-8 mr-2 mb-2 mt-1 rounded-md bg-[#0A0E17] border border-(--border) p-4 flex flex-col gap-3">
                      <div className="overflow-x-auto text-gray-300">
                        <pre className="text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                      <div className="flex justify-end border-t border-(--border) pt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/?correlate_time=${encodeURIComponent(log.timestamp)}&correlate_node=${encodeURIComponent(log.source)}`;
                          }}
                          className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded transition-colors"
                        >
                          <Play className="h-3 w-3" />
                          Correlacionar Métricas
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
