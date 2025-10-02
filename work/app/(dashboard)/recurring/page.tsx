// app/(dashboard)/recurring/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calendar, RefreshCw, Trash2, Edit, Play } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { RecurringTransactionDialog } from "@/components/recurring-transaction-dialog"

interface RecurringTransaction {
  id: string
  name: string
  amount: number
  type: string
  merchant?: string
  memo?: string
  frequency: string
  dayOfMonth?: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
  lastRun?: string
  isActive: boolean
  category?: {
    id: string
    name: string
    color?: string
  }
  account: {
    id: string
    name: string
  }
}

function formatKRW(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

function getFrequencyText(frequency: string, dayOfMonth?: number, dayOfWeek?: number) {
  if (frequency === "monthly" && dayOfMonth) {
    return `매월 ${dayOfMonth}일`
  }
  if (frequency === "weekly" && dayOfWeek !== undefined) {
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return `매주 ${days[dayOfWeek]}요일`
  }
  if (frequency === "yearly") {
    return "매년"
  }
  return frequency
}

export default function RecurringTransactionsPage() {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<
    RecurringTransaction | undefined
  >(undefined)

  useEffect(() => {
    loadRecurringTransactions()
    loadCategoriesAndAccounts()
  }, [])

  async function loadRecurringTransactions() {
    setLoading(true)
    try {
      const response = await fetch("/api/recurring")
      if (response.ok) {
        const data = await response.json()
        setRecurringTransactions(data)
      }
    } catch (error) {
      console.error("고정 지출 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategoriesAndAccounts() {
    try {
      const [catRes, accRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/accounts"),
      ])

      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(catData)
      }
      if (accRes.ok) {
        const accData = await accRes.json()
        setAccounts(accData)
      }
    } catch (error) {
      console.error("카테고리/계정 조회 오류:", error)
    }
  }

  function handleAdd() {
    setEditingRecurring(undefined)
    setDialogOpen(true)
  }

  function handleEdit(recurring: RecurringTransaction) {
    setEditingRecurring(recurring)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    loadRecurringTransactions()
  }

  async function handleGenerateTransactions() {
    if (!confirm("오늘 날짜 기준으로 고정 지출을 생성하시겠습니까?")) {
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/recurring/generate", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.count}개의 거래가 생성되었습니다.`)
        loadRecurringTransactions()
      } else {
        const error = await response.json()
        alert(`오류: ${error.error}`)
      }
    } catch (error) {
      console.error("거래 생성 오류:", error)
      alert("거래 생성 중 오류가 발생했습니다.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        loadRecurringTransactions()
      }
    } catch (error) {
      console.error("상태 변경 오류:", error)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 고정 지출을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadRecurringTransactions()
      } else {
        alert("삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("삭제 오류:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const activeTransactions = recurringTransactions.filter((t) => t.isActive)
  const inactiveTransactions = recurringTransactions.filter((t) => !t.isActive)

  if (loading) {
    return <div className="p-6">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">고정 지출</h1>
          <p className="text-muted-foreground">
            매월/매주/매년 자동으로 생성되는 지출을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateTransactions} disabled={generating}>
            <Play className="mr-2 h-4 w-4" />
            {generating ? "생성 중..." : "지금 생성"}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            고정 지출 추가
          </Button>
        </div>
      </div>

      {/* 다이얼로그 */}
      <RecurringTransactionDialog
        categories={categories}
        accounts={accounts}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurring={editingRecurring}
        onSuccess={handleDialogSuccess}
      />

      {/* 활성 고정 지출 */}
      <Card>
        <CardHeader>
          <CardTitle>활성 고정 지출 ({activeTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              활성 고정 지출이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTransactions.map((recurring) => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{recurring.name}</span>
                      {recurring.category && (
                        <Badge variant="outline">{recurring.category.name}</Badge>
                      )}
                      <Badge variant="secondary">
                        <Calendar className="mr-1 h-3 w-3" />
                        {getFrequencyText(
                          recurring.frequency,
                          recurring.dayOfMonth,
                          recurring.dayOfWeek
                        )}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {recurring.account.name}
                      {recurring.lastRun && (
                        <span className="ml-2">
                          마지막 실행: {recurring.lastRun}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        recurring.type === "expense"
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                    >
                      {recurring.type === "expense" ? "-" : "+"}
                      {formatKRW(recurring.amount)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleActive(recurring.id, recurring.isActive)
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recurring)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recurring.id, recurring.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비활성 고정 지출 */}
      {inactiveTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>비활성 고정 지출 ({inactiveTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTransactions.map((recurring) => (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 opacity-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{recurring.name}</span>
                      {recurring.category && (
                        <Badge variant="outline">{recurring.category.name}</Badge>
                      )}
                      <Badge variant="secondary">
                        {getFrequencyText(
                          recurring.frequency,
                          recurring.dayOfMonth,
                          recurring.dayOfWeek
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatKRW(recurring.amount)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleActive(recurring.id, recurring.isActive)
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recurring.id, recurring.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
