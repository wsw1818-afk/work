"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

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

interface RecurringTransactionDialogProps {
  categories: Category[]
  accounts: Account[]
  open: boolean
  onOpenChange: (open: boolean) => void
  recurring?: RecurringTransaction
  onSuccess: () => void
}

export function RecurringTransactionDialog({
  categories,
  accounts,
  open,
  onOpenChange,
  recurring,
  onSuccess,
}: RecurringTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [frequency, setFrequency] = useState<string>(recurring?.frequency || "monthly")

  useEffect(() => {
    if (recurring) {
      setFrequency(recurring.frequency)
    } else {
      setFrequency("monthly")
    }
  }, [recurring, open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      merchant: formData.get("merchant") as string || null,
      amount: parseInt(formData.get("amount") as string),
      type: formData.get("type") as string,
      categoryId: formData.get("categoryId") as string || null,
      accountId: formData.get("accountId") as string,
      memo: formData.get("memo") as string || null,
      frequency: formData.get("frequency") as string,
      dayOfMonth: formData.get("dayOfMonth") ? parseInt(formData.get("dayOfMonth") as string) : null,
      dayOfWeek: formData.get("dayOfWeek") !== "" ? parseInt(formData.get("dayOfWeek") as string) : null,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || null,
    }

    try {
      const url = recurring ? `/api/recurring/${recurring.id}` : "/api/recurring"
      const method = recurring ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "반복 거래 저장 실패")
      }

      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      alert(error.message || "반복 거래 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {recurring ? "반복 거래 수정" : "반복 거래 추가"}
            </DialogTitle>
            <DialogDescription>
              {recurring
                ? "반복 거래 정보를 수정하세요."
                : "새로운 반복 거래를 추가하세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 *
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="col-span-3"
                placeholder="넷플릭스 구독료"
                defaultValue={recurring?.name}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                유형 *
              </Label>
              <Select name="type" defaultValue={recurring?.type || "expense"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">지출</SelectItem>
                  <SelectItem value="income">수입</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                금액 *
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1"
                required
                className="col-span-3"
                placeholder="10000"
                defaultValue={recurring?.amount}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchant" className="text-right">
                가맹점
              </Label>
              <Input
                id="merchant"
                name="merchant"
                className="col-span-3"
                placeholder="넷플릭스"
                defaultValue={recurring?.merchant}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                카테고리
              </Label>
              <Select name="categoryId" defaultValue={recurring?.category?.id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="선택..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountId" className="text-right">
                계정 *
              </Label>
              <Select
                name="accountId"
                required
                defaultValue={recurring?.account?.id || accounts[0]?.id}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="선택..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                반복 주기 *
              </Label>
              <Select
                name="frequency"
                defaultValue={recurring?.frequency || "monthly"}
                onValueChange={setFrequency}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">매월</SelectItem>
                  <SelectItem value="weekly">매주</SelectItem>
                  <SelectItem value="yearly">매년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "monthly" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dayOfMonth" className="text-right">
                  반복 일 *
                </Label>
                <Input
                  id="dayOfMonth"
                  name="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  required
                  className="col-span-3"
                  placeholder="1-31"
                  defaultValue={recurring?.dayOfMonth}
                />
              </div>
            )}

            {frequency === "weekly" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dayOfWeek" className="text-right">
                  반복 요일 *
                </Label>
                <Select
                  name="dayOfWeek"
                  defaultValue={recurring?.dayOfWeek?.toString()}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="선택..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">일요일</SelectItem>
                    <SelectItem value="1">월요일</SelectItem>
                    <SelectItem value="2">화요일</SelectItem>
                    <SelectItem value="3">수요일</SelectItem>
                    <SelectItem value="4">목요일</SelectItem>
                    <SelectItem value="5">금요일</SelectItem>
                    <SelectItem value="6">토요일</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                시작일 *
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="col-span-3"
                defaultValue={
                  recurring?.startDate || new Date().toISOString().split("T")[0]
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                종료일
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="col-span-3"
                defaultValue={recurring?.endDate}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memo" className="text-right">
                메모
              </Label>
              <Textarea
                id="memo"
                name="memo"
                className="col-span-3"
                placeholder="추가 정보 입력..."
                rows={3}
                defaultValue={recurring?.memo}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
