"use client"

import * as React from "react"
import ReactECharts from "echarts-for-react"
import { useTheme } from "next-themes"

interface HistogramChartProps {
  data: number[]
  times: string[]
}

export function HistogramChart({ data, times }: HistogramChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      borderColor: isDark ? "rgba(234, 230, 223, 0.1)" : "rgba(10, 14, 23, 0.1)",
      textStyle: { color: isDark ? "#EAE6DF" : "#0A0E17" },
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
      data: times,
      show: false,
    },
    yAxis: {
      type: "value",
      show: false,
    },
    series: [
      {
        type: "bar",
        data: data,
        itemStyle: { color: "#3B82F6" },
        barCategoryGap: "20%",
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
}
