// app/(dashboard)/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export const dynamic = "force-dynamic"

async function getDashboardData() {
  // 현재 월 계산
  const now = new Date()
  const currentMonth = format(now, "yyyy-MM")
  const startDate = `${currentMonth}-01`
  const endDate = format(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
    "yyyy-MM-dd"
  )

  // 이번 달 거래 내역
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "confirmed",
    },
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })

  // 지출/수입 합계
  const expenses = transactions
    .filter((t) => t.type === "expense" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const netAmount = income - expenses

  // 카테고리별 지출
  const categoryMap = new Map<string, { name: string; total: number; color?: string }>()
  transactions
    .filter((t) => t.type === "expense" && t.category)
    .forEach((t) => {
      const catName = t.category!.name
      const existing = categoryMap.get(catName) || { name: catName, total: 0, color: t.category!.color || undefined }
      categoryMap.set(catName, {
        ...existing,
        total: existing.total + t.amount,
      })
    })

  const categoryExpenses = Array.from(categoryMap.values()).sort(
    (a, b) => b.total - a.total
  )

  return {
    expenses,
    income,
    netAmount,
    transactions,
    categoryExpenses,
    currentMonth,
  }
}

function formatKRW(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export default async function DashboardPage() {
  const data = await getDashboardData()

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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatKRW(data.expenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">수입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatKRW(data.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">순지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.netAmount < 0 ? "text-destructive" : "text-green-600"
              }`}
            >
              {formatKRW(Math.abs(data.netAmount))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 지출 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 지출</CardTitle>
        </CardHeader>
        <CardContent>
          {data.categoryExpenses.length > 0 ? (
            <div className="space-y-3">
              {data.categoryExpenses.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color || "#94a3b8" }}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatKRW(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              이번 달 거래 내역이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 최근 거래 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 거래 (최대 20건)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.transactions.length > 0 ? (
            <div className="space-y-2">
              {data.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tx.merchant || "거래처 없음"}</span>
                      {tx.category && (
                        <Badge variant="outline">{tx.category.name}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tx.date} • {tx.account.name}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      tx.type === "expense" ? "text-destructive" : "text-green-600"
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
  )
}
