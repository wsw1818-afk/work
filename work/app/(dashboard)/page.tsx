"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface DashboardSummary {
  period: { year: number; month: number }
  summary: {
    income: number
    expense: number
    balance: number
  }
  topCategories: Array<{
    category: {
      id: string
      name: string
      color: string | null
    }
    amount: number
    count: number
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    type: "income" | "expense"
    memo: string | null
    merchant: string | null
    date: string
    category: {
      name: string
      color: string | null
    } | null
    account: {
      name: string
      type: string
      color: string | null
    }
  }>
}

function formatKRW(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const response = await fetch(
          `/api/dashboard/summary?year=${year}&month=${month}`
        )
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("대시보드 데이터 로드 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const { summary, topCategories, recentTransactions } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "yyyy년 M월", { locale: ko })} 재정 현황
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 수입</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatKRW(summary.income)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 수입 총액
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatKRW(summary.expense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 지출 총액
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">수지</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.balance >= 0 ? "text-green-600" : "text-destructive"
              }`}
            >
              {summary.balance >= 0 ? "+" : "-"}
              {formatKRW(Math.abs(summary.balance))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.balance >= 0 ? "흑자" : "적자"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 카테고리별 TOP 5 지출 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((item, index) => (
                  <div key={item.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: item.category.color || "#94a3b8",
                          }}
                        />
                        <span className="font-medium">
                          {item.category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatKRW(item.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.count}건
                        </div>
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            (item.amount / topCategories[0].amount) * 100,
                            100
                          )}%`,
                          backgroundColor: item.category.color || undefined,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                이번 달 지출 내역이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 최근 거래 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 거래</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {tx.merchant || tx.memo || "거래처 없음"}
                        </span>
                        {tx.category && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: tx.category.color || undefined,
                              color: tx.category.color || undefined,
                            }}
                          >
                            {tx.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.date), "M월 d일", { locale: ko })} •{" "}
                        {tx.account.name}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        tx.type === "expense"
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {formatKRW(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                최근 거래 내역이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            <a
              href="/transactions"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">거래 내역</span>
            </a>
            <a
              href="/recurring"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">반복 거래</span>
            </a>
            <a
              href="/calculator"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">가계부 작성</span>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-medium">설정</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
