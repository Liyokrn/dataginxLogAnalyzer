"use client"

import * as React from "react"
import { Activity, Cpu, HardDrive, Network } from "lucide-react"
import { MetricChart } from "@/components/MetricChart"

// Mock data generator
const generateMockData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min))
}

const mockTimes = Array.from({ length: 20 }, (_, i) => `10:${i.toString().padStart(2, '0')}`)

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Real-time observability and infrastructure metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "CPU Usage", icon: Cpu, value: "45%", status: "text-(--status-ok)", color: "#10B981", data: generateMockData(20, 30, 60) },
          { title: "Memory", icon: Activity, value: "72%", status: "text-(--status-warn)", color: "#F59E0B", data: generateMockData(20, 60, 80) },
          { title: "Network", icon: Network, value: "1.2 GB/s", status: "text-(--status-ok)", color: "#3B82F6", data: generateMockData(20, 0.8, 1.5) },
          { title: "Storage", icon: HardDrive, value: "92%", status: "text-(--status-critical)", color: "#EF4444", data: generateMockData(20, 90, 95) },
        ].map((stat) => (
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
              <MetricChart data={stat.data} times={mockTimes} color={stat.color} title={stat.title} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <h3 className="text-sm font-medium mb-4">Anomaly Heatmap</h3>
          <div className="h-64 flex items-center justify-center border border-(--border) border-dashed rounded-lg text-gray-500">
            [ECharts Heatmap Placeholder]
          </div>
        </div>
        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <h3 className="text-sm font-medium mb-4">Global Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-(--border) p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-(--status-critical)" />
                <div className="text-sm font-medium">Storage critical on node-03</div>
              </div>
              <div className="text-xs text-gray-500">2 min ago</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--border) p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-(--status-warn)" />
                <div className="text-sm font-medium">High memory usage on Auth Service</div>
              </div>
              <div className="text-xs text-gray-500">15 min ago</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--border) p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-(--status-ok)" />
                <div className="text-sm font-medium">New deployment: Payment Gateway v2.4</div>
              </div>
              <div className="text-xs text-gray-500">1 hr ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
