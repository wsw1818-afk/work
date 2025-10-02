"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: string
  name: string
  color: string | null
}

interface BudgetSummary {
  budgetId: string
  categoryId: string
  categoryName: string
  categoryColor: string | null
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentage: number
  status: "ok" | "warning" | "exceeded"
}

interface BudgetData {
  month: string
  categories: BudgetSummary[]
  total: {
    budgetAmount: number
    spentAmount: number
    remainingAmount: number
    percentage: number
    status: "ok" | "warning" | "exceeded"
  }
}

export default function BudgetsPage() {
  const { data: session } = useSession()
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 현재 월 기본값
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // 폼 상태
  const [formData, setFormData] = useState({
    categoryId: "",
    limitAmount: "",
  })

  useEffect(() => {
    if (session?.user?.id) {
      loadCategories()
      loadBudgetSummary(selectedMonth)
    }
  }, [session, selectedMonth])

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("카테고리 로드 실패:", error)
    }
  }

  const loadBudgetSummary = async (month: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/budgets/summary?month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setBudgetData(data)
      }
    } catch (error) {
      console.error("예산 요약 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async () => {
    if (!formData.categoryId || !formData.limitAmount) {
      alert("카테고리와 예산 금액을 입력해주세요.")
      return
    }

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          categoryId: formData.categoryId,
          limitAmount: parseInt(formData.limitAmount),
        }),
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({ categoryId: "", limitAmount: "" })
        loadBudgetSummary(selectedMonth)
      } else {
        const error = await res.json()
        alert(error.error || "예산 설정에 실패했습니다.")
      }
    } catch (error) {
      console.error("예산 생성 실패:", error)
      alert("예산 설정에 실패했습니다.")
    }
  }

  const handleDeleteBudget = async (budgetId: string, categoryName: string) => {
    if (!confirm(`"${categoryName}" 예산을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        loadBudgetSummary(selectedMonth)
      } else {
        const error = await res.json()
        alert(error.error || "예산 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("예산 삭제 실패:", error)
      alert("예산 삭제에 실패했습니다.")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "exceeded":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <TrendingUp className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "exceeded":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-green-600"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">예산 관리</h1>
          <p className="text-muted-foreground mt-1">
            {selectedMonth} 예산 현황
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                예산 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 예산 설정</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="month">월</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="카테고리 선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(c => c.name !== "수입") // 수입 카테고리 제외
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">예산 금액 (원)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100000"
                    value={formData.limitAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, limitAmount: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateBudget} className="w-full">
                  추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 전체 요약 카드 */}
      {budgetData && budgetData.total.budgetAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>전체 예산 현황</span>
              {getStatusIcon(budgetData.total.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">예산</span>
                <span className="font-semibold">
                  {formatCurrency(budgetData.total.budgetAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">지출</span>
                <span className={getStatusColor(budgetData.total.status)}>
                  {formatCurrency(budgetData.total.spentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">잔액</span>
                <span className={budgetData.total.remainingAmount < 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(budgetData.total.remainingAmount)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>진행률</span>
                  <span>{budgetData.total.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={budgetData.total.percentage} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 카테고리별 예산 */}
      {budgetData && budgetData.categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetData.categories.map((item) => (
            <Card key={item.categoryId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{item.categoryName}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteBudget(item.budgetId, item.categoryName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">예산</span>
                    <span className="font-medium">
                      {formatCurrency(item.budgetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">지출</span>
                    <span className={getStatusColor(item.status)}>
                      {formatCurrency(item.spentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">잔액</span>
                    <span className={item.remainingAmount < 0 ? "text-red-600" : ""}>
                      {formatCurrency(item.remainingAmount)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>사용률</span>
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>설정된 예산이 없습니다.</p>
            <p className="text-sm mt-2">
              &quot;예산 추가&quot; 버튼을 클릭하여 카테고리별 예산을 설정하세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
