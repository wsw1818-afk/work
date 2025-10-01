// components/charts/category-pie-chart.tsx
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryData {
  name: string
  value: number
  color?: string
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

const COLORS = [
  "#ef4444", // 식비
  "#f59e0b", // 카페/간식
  "#3b82f6", // 교통
  "#8b5cf6", // 주거/관리
  "#06b6d4", // 통신
  "#ec4899", // 쇼핑
  "#10b981", // 여가/문화
  "#14b8a6", // 의료
  "#6366f1", // 교육
  "#6b7280", // 기타
]

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    )
  }

  // 데이터에 색상 추가
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || COLORS[index % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(value)
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
