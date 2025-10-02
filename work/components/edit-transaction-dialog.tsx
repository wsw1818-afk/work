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
import { Pencil, Trash2 } from "lucide-react"

interface Transaction {
  id: string
  date: string
  merchant: string | null
  amount: number
  type: "income" | "expense"
  categoryId: string | null
  accountId: string
  memo: string | null
  category?: { id: string; name: string } | null
  account: { id: string; name: string }
}

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface EditTransactionDialogProps {
  transaction: Transaction
  categories: Category[]
  accounts: Account[]
}

export function EditTransactionDialog({
  transaction,
  categories,
  accounts,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    date: "",
    merchant: "",
    amount: 0,
    type: "expense" as "income" | "expense",
    categoryId: "",
    accountId: "",
    memo: "",
  })

  useEffect(() => {
    if (open) {
      setFormData({
        date: transaction.date,
        merchant: transaction.merchant || "",
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId || "",
        accountId: transaction.accountId,
        memo: transaction.memo || "",
      })
    }
  }, [open, transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`수정 실패: ${error.error}`)
      }
    } catch (error) {
      console.error("거래 수정 오류:", error)
      alert("거래 수정 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("이 거래를 삭제하시겠습니까?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`삭제 실패: ${error.error}`)
      }
    } catch (error) {
      console.error("거래 삭제 오류:", error)
      alert("거래 삭제 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>거래 수정</DialogTitle>
              <DialogDescription>거래 정보를 수정하거나 삭제할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">지출</SelectItem>
                  <SelectItem value="income">수입</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="merchant">가맹점</Label>
              <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="예: 스타벅스"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.categoryId || "unassigned"}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value === "unassigned" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">미분류</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account">계정</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="grid gap-2">
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="선택 사항"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
