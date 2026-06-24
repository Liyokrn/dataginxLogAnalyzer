"use client"

import * as React from "react"
import { Search, RefreshCw, Server, AlertCircle, CheckCircle2 } from "lucide-react"

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/proxy/agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredAgents = agents.filter(a => 
    a.source_node?.toLowerCase().includes(search.toLowerCase()) || 
    a.project_id?.toLowerCase().includes(search.toLowerCase())
  )

  const isOnline = (lastSeen: string) => {
    const timeDiff = Date.now() - new Date(lastSeen).getTime();
    return timeDiff < 5 * 60 * 1000; // 5 minutes
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Active Agents</h1>
        <button onClick={fetchAgents} className="flex items-center gap-2 rounded-md border border-(--border) bg-(--card) px-4 py-2 text-sm hover:bg-(--accent) transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-(--border) bg-(--card) py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            placeholder='Search by node or project...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6">
        {loading && agents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading agents...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No agents found matching criteria.</div>
        ) : (
          filteredAgents.map((agent, i) => {
            const online = isOnline(agent.last_seen)
            return (
              <div key={i} className="flex flex-col rounded-xl border border-(--border) bg-(--card) overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                <div className={`h-1 w-full ${online ? 'bg-(--status-ok)' : 'bg-(--status-critical)'}`} />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${online ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{agent.source_node || 'Unknown Node'}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {online ? (
                            <CheckCircle2 className="h-3 w-3 text-(--status-ok)" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-(--status-critical)" />
                          )}
                          <span className={`text-xs font-medium ${online ? 'text-(--status-ok)' : 'text-(--status-critical)'}`}>
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-900/30 text-blue-400 border border-blue-800/50 uppercase">
                      {agent.env || 'ENV'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-2 pt-4 border-t border-(--border)/50">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Project</span>
                      <span className="font-mono truncate" title={agent.project_id}>{agent.project_id || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">OS</span>
                      <span className="capitalize">{agent.os || '-'}</span>
                    </div>
                    <div className="col-span-2 flex flex-col mt-1">
                      <span className="text-gray-500 text-xs">Last Heartbeat</span>
                      <span className="font-mono text-gray-300">{agent.last_seen || 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
