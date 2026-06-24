"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Activity, Cpu, HardDrive, Network, RefreshCw, AlertCircle } from "lucide-react"
import { MetricChart } from "@/components/MetricChart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

// Mock data generator
const generateMockData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min))
}

const defaultMockTimes = Array.from({ length: 20 }, (_, i) => `10:${i.toString().padStart(2, '0')}`)

function formatTimeAgo(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours} hr ago`;
}

const transformVolumeData = (rawData: any[]) => {
  const map = new Map<string, any>();
  rawData.forEach(item => {
    // Format timestamp: e.g. "2026-06-22 12:00:00" -> "12:00"
    let timeLabel = "unknown";
    try {
      const date = new Date(item.time_bucket.replace(' ', 'T') + 'Z');
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      timeLabel = item.time_bucket;
    }
    
    if (!map.has(timeLabel)) {
      map.set(timeLabel, { time: timeLabel, INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 });
    }
    const bucket = map.get(timeLabel);
    
    const level = item.level.toUpperCase();
    if (level === 'INFO') bucket.INFO += Number(item.log_count);
    else if (level === 'WARN' || level === 'WARNING') bucket.WARNING += Number(item.log_count);
    else if (level === 'ERROR') bucket.ERROR += Number(item.log_count);
    else if (level === 'CRITICAL') bucket.CRITICAL += Number(item.log_count);
  });
  return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
};

function DashboardContent() {
  const searchParams = useSearchParams()
  const correlateTime = searchParams.get('correlate_time')
  const correlateNode = searchParams.get('correlate_node')

  const [loading, setLoading] = React.useState(false)
  const [metricData, setMetricData] = React.useState<any>(null)
  
  const [alerts, setAlerts] = React.useState<any[]>([
    { id: '1', message: "Storage critical on node-03", level: "CRITICAL", timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: '2', message: "High memory usage on Auth Service", level: "WARNING", timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: '3', message: "New deployment: Payment Gateway v2.4", level: "INFO", timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]);

  // Analytics states
  const [volumeData, setVolumeData] = React.useState<any[]>([]);
  const [errorsByModuleData, setErrorsByModuleData] = React.useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [volRes, errRes] = await Promise.all([
        fetch('/api/proxy/analytics/volume'),
        fetch('/api/proxy/analytics/errors_by_module')
      ]);
      const volData = await volRes.json();
      const errData = await errRes.json();

      setVolumeData(transformVolumeData(volData));
      setErrorsByModuleData(errData.map((item: any) => ({
        name: item.extracted_module,
        errors: Number(item.error_count)
      })));
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  React.useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WS] Connected to backend alerts server");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'anomaly_detected') {
          const newAlert = {
            id: Math.random().toString(),
            message: `Anomaly on module "${payload.module}": ${payload.issue}`,
            level: payload.level,
            timestamp: payload.timestamp,
            isNew: true
          };
          setAlerts(prev => [newAlert, ...prev]);
        }
      } catch (err) {
        console.error("[WS] Error parsing message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected from backend alerts server");
    };

    return () => {
      ws.close();
    };
  }, []);

  React.useEffect(() => {
    if (correlateTime && correlateNode) {
      setLoading(true)
      fetch('/api/proxy/metrics/correlate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: correlateTime,
          source_node: correlateNode,
          windowMinutes: 5
        })
      })
      .then(r => r.json())
      .then(data => setMetricData(data))
      .catch(err => console.error('Correlate error:', err))
      .finally(() => setLoading(false))
    }
  }, [correlateTime, correlateNode])

  let times = defaultMockTimes
  let targetTimeFormatted: string | undefined = undefined

  let stats = [
    { title: "CPU Usage", icon: Cpu, value: "45%", status: "text-(--status-ok)", color: "#10B981", data: generateMockData(20, 30, 60), metricKey: 'cpu_percent' },
    { title: "Memory", icon: Activity, value: "72%", status: "text-(--status-warn)", color: "#F59E0B", data: generateMockData(20, 60, 80), metricKey: 'memory_used_bytes' },
    { title: "Network", icon: Network, value: "1.2 GB/s", status: "text-(--status-ok)", color: "#3B82F6", data: generateMockData(20, 0.8, 1.5), metricKey: 'network_rx' },
    { title: "Storage", icon: HardDrive, value: "92%", status: "text-(--status-critical)", color: "#EF4444", data: generateMockData(20, 90, 95), metricKey: 'disk' },
  ]

  if (metricData && metricData.metrics) {
    // Extract unique times
    const timeSet = new Set<string>()
    metricData.metrics.forEach((m: any) => {
      const formatted = new Date(m.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      timeSet.add(formatted)
    })
    times = Array.from(timeSet).sort()

    targetTimeFormatted = new Date(metricData.target_timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Map metrics to the UI
    stats = stats.map(stat => {
      const specificMetrics = metricData.metrics.filter((m: any) => m.metric_name === stat.metricKey)
      if (specificMetrics.length > 0) {
        // Group by time mapped to the unique 'times' array
        const dataArr = times.map(t => {
          const match = specificMetrics.find((m: any) => new Date(m.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === t)
          return match ? match.value : 0
        })
        return { ...stat, data: dataArr }
      }
      return stat
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {correlateTime ? `Correlated Metrics: Node ${correlateNode}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500">
            {correlateTime 
              ? `Showing ±5 minute window around error at ${targetTimeFormatted}` 
              : 'Real-time observability and infrastructure metrics.'}
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={analyticsLoading}
          className="flex items-center gap-1.5 text-xs bg-(--background) border border-(--border) hover:border-gray-600 text-gray-400 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${analyticsLoading ? 'animate-spin' : ''}`} />
          Refresh Charts
        </button>
      </div>

      {/* Resource Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-(--border) bg-(--card) p-6 flex flex-col h-40"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <stat.icon className={`h-4 w-4 ${stat.status}`} />
            </div>
            <div className="flex items-baseline text-2xl font-semibold mb-4">
              {stat.value}
            </div>
            <div className="flex-1 -mx-2 -mb-2">
              <MetricChart 
                data={stat.data} 
                times={times} 
                color={stat.color} 
                title={stat.title} 
                targetTime={targetTimeFormatted} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* System Metrics Section (New Recharts Charts) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-(--border) bg-(--card) p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-medium">Log Ingestion Volume (24h)</h3>
            <p className="text-xs text-gray-500">Real-time log events grouped by hour and level</p>
          </div>
          <div className="flex-1 min-h-[240px] flex items-center justify-center">
            {analyticsLoading ? (
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" /> Loading analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="INFO" stroke="#3B82F6" fillOpacity={1} fill="url(#colorInfo)" />
                  <Area type="monotone" dataKey="WARNING" stroke="#F59E0B" fillOpacity={1} fill="url(#colorWarning)" />
                  <Area type="monotone" dataKey="ERROR" stroke="#EF4444" fillOpacity={1} fill="url(#colorError)" />
                  <Area type="monotone" dataKey="CRITICAL" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorCritical)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-medium">Top Errors by Module</h3>
            <p className="text-xs text-gray-500">Highest ERROR and CRITICAL rates by microservice</p>
          </div>
          <div className="flex-1 min-h-[240px] flex items-center justify-center">
            {analyticsLoading ? (
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" /> Loading analytics...
              </div>
            ) : errorsByModuleData.length === 0 ? (
              <div className="text-xs text-gray-500">No errors detected in modules.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={errorsByModuleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 9 }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', fontSize: 11 }} />
                  <Bar dataKey="errors" fill="#EF4444" radius={[4, 4, 0, 0]}>
                    {errorsByModuleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap and Alerts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <h3 className="text-sm font-medium mb-4">Anomaly Heatmap</h3>
          <div className="h-64 flex items-center justify-center border border-(--border) border-dashed rounded-lg text-gray-500">
            [ECharts Heatmap Placeholder]
          </div>
        </div>
        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <h3 className="text-sm font-medium mb-4">Global Alerts</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const bgDotColor = alert.level === 'CRITICAL' ? 'bg-(--status-critical)' : alert.level === 'WARNING' ? 'bg-(--status-warn)' : 'bg-(--status-ok)';
              const borderHighlight = alert.isNew ? 'border-red-500/80 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.15)] animate-pulse' : 'border-(--border)';
              
              return (
                <div key={alert.id} className={`flex items-center justify-between rounded-lg border p-4 transition-all duration-500 ${borderHighlight}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${bgDotColor}`} />
                    <div className="text-sm font-medium">{alert.message}</div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">{formatTimeAgo(alert.timestamp)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </React.Suspense>
  )
}
