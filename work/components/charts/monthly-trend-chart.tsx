// components/charts/monthly-trend-chart.tsx
"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface MonthlyData {
  month: string
  expense: number
  income: number
}

interface MonthlyTrendChartProps {
  data: MonthlyData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("ko-KR", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(value)
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          name="지출"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          name="수입"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
