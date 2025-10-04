"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { EditTransactionButton } from "@/components/edit-transaction-button"
import { Edit2, X, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  date: string
  cardName: string | null
  merchant: string | null
  amount: number
  type: string
  memo: string | null
  category: { id: string; name: string } | null
  account: { id: string; name: string }
  receipts: any[]
}

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface BulkEditTransactionsProps {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
}

export function BulkEditTransactions({
  transactions,
  categories,
  accounts,
}: BulkEditTransactionsProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [bulkData, setBulkData] = useState({
    categoryId: "__NONE__",
    accountId: "__NONE__",
  })

  const formatKRW = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(transactions.map((t) => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) {
      alert("수정할 거래를 선택해주세요.")
      return
    }

    const categoryId = bulkData.categoryId === "__NONE__" ? undefined : bulkData.categoryId
    const accountId = bulkData.accountId === "__NONE__" ? undefined : bulkData.accountId

    if (!categoryId && !accountId) {
      alert("변경할 카테고리 또는 계정을 선택해주세요.")
      return
    }

    if (
      !confirm(
        `선택한 ${selectedIds.size}건의 거래를 일괄 수정하시겠습니까?`
      )
    ) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch("/api/transactions/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionIds: Array.from(selectedIds),
          categoryId,
          accountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "일괄 수정 실패")
      }

      alert(`✅ ${data.updatedCount}건의 거래가 수정되었습니다.`)
      setDialogOpen(false)
      setSelectedIds(new Set())
      setBulkData({ categoryId: "__NONE__", accountId: "__NONE__" })
      router.refresh()
    } catch (error: any) {
      alert("❌ " + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert("삭제할 거래를 선택해주세요.")
      return
    }

    if (
      !confirm(
        `⚠️ 선택한 ${selectedIds.size}건의 거래를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionIds: Array.from(selectedIds),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "일괄 삭제 실패")
      }

      alert(`✅ ${data.deletedCount}건의 거래가 삭제되었습니다.`)
      setSelectedIds(new Set())
      router.refresh()
    } catch (error: any) {
      alert("❌ " + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const allSelected =
    transactions.length > 0 && selectedIds.size === transactions.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < transactions.length

  return (
    <div className="space-y-4">
      {/* 일괄 수정/삭제 버튼 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setDialogOpen(true)}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            선택한 {selectedIds.size}건 일괄 수정
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={updating}
          >
            <Trash2 className="h-4 w-4" />
            선택한 {selectedIds.size}건 일괄 삭제
          </Button>
          <Button
            onClick={() => setSelectedIds(new Set())}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <X className="h-4 w-4" />
            선택 해제
          </Button>
        </div>
      )}

      {/* 거래 목록 테이블 */}
      {transactions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="모두 선택"
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>분류</TableHead>
              <TableHead>가맹점</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>메모</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead className="text-center">영수증</TableHead>
              <TableHead className="text-center w-[60px]">편집</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className={selectedIds.has(tx.id) ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(tx.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(tx.id, checked as boolean)
                    }
                    aria-label={`${tx.merchant || "거래"} 선택`}
                  />
                </TableCell>
                <TableCell className="font-medium">{tx.date}</TableCell>
                <TableCell>
                  {tx.cardName ? (
                    <Badge variant="secondary">{tx.cardName}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{tx.merchant || "-"}</TableCell>
                <TableCell>
                  {tx.category ? (
                    <Badge variant="outline">{tx.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">미분류</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {tx.memo || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    tx.type === "expense"
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  {tx.type === "expense" ? "-" : "+"}
                  {formatKRW(tx.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {tx.receipts.length > 0 ? (
                    <Badge variant="secondary">{tx.receipts.length}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <EditTransactionButton
                    transaction={tx as any}
                    categories={categories}
                    accounts={accounts}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            조건에 맞는 거래 내역이 없습니다.
          </p>
        </div>
      )}

      {/* 일괄 수정 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              선택한 {selectedIds.size}건의 거래 일괄 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>카테고리 변경 (선택)</Label>
              <Select
                value={bulkData.categoryId}
                onValueChange={(value) =>
                  setBulkData({ ...bulkData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="변경하지 않음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">변경하지 않음</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>계정 변경 (선택)</Label>
              <Select
                value={bulkData.accountId}
                onValueChange={(value) =>
                  setBulkData({ ...bulkData, accountId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="변경하지 않음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">변경하지 않음</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              * 카테고리 또는 계정 중 최소 하나는 선택해야 합니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={updating}
            >
              취소
            </Button>
            <Button onClick={handleBulkUpdate} disabled={updating}>
              {updating ? "수정 중..." : "일괄 수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
