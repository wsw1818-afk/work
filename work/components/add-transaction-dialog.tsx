"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface AddTransactionDialogProps {
  categories: Category[]
  accounts: Account[]
}

export function AddTransactionDialog({ categories, accounts }: AddTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      date: formData.get("date") as string,
      merchant: formData.get("merchant") as string,
      amount: parseFloat(formData.get("amount") as string),
      type: formData.get("type") as string,
      categoryId: formData.get("categoryId") as string || null,
      accountId: formData.get("accountId") as string,
      memo: formData.get("memo") as string || "",
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "거래 추가 실패")
      }

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "거래 추가 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          거래 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 거래 추가</DialogTitle>
            <DialogDescription>
              새로운 거래 내역을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                날짜 *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="col-span-3"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                유형 *
              </Label>
              <Select name="type" defaultValue="expense" required>
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
                placeholder="스타벅스"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                카테고리
              </Label>
              <Select name="categoryId">
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
              <Select name="accountId" required>
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
              <Label htmlFor="memo" className="text-right">
                메모
              </Label>
              <Textarea
                id="memo"
                name="memo"
                className="col-span-3"
                placeholder="추가 정보 입력..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
