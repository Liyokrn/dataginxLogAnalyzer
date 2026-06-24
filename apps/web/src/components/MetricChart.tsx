"use client"

import * as React from "react"
import ReactECharts from "echarts-for-react"
import { useTheme } from "next-themes"

interface MetricChartProps {
  data: number[]
  times: string[]
  color: string
  title: string
  targetTime?: string
}

export function MetricChart({ data, times, color, title, targetTime }: MetricChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system" // simplified

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#161b22" : "#FFFFFF",
      borderColor: isDark ? "rgba(48, 54, 61, 0.7)" : "rgba(13, 17, 23, 0.1)",
      textStyle: { color: isDark ? "#e6edf3" : "#0d1117" },
    },
    grid: {
      left: "0",
      right: "0",
      bottom: "0",
      top: "10px",
      containLabel: false,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: times,
      show: false,
    },
    yAxis: {
      type: "value",
      show: false,
    },
    series: [
      {
        name: title,
        type: "line",
        smooth: true,
        symbol: "none",
        sampling: "average",
        itemStyle: { color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}80` },
              { offset: 1, color: `${color}00` },
            ],
          },
        },
        data: data,
        markLine: targetTime ? {
          symbol: "none",
          lineStyle: { color: "#EF4444", type: "solid", width: 2 },
          label: { show: false },
          data: [{ xAxis: targetTime }]
        } : undefined,
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
}
