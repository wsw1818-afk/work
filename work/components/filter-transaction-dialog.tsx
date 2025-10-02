// components/filter-transaction-dialog.tsx
"use client"

import { useState } from "react"
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
import { Filter } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface FilterTransactionDialogProps {
  categories: Category[]
  accounts: Account[]
}

export function FilterTransactionDialog({
  categories,
  accounts,
}: FilterTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleApplyFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (categoryId && categoryId !== "all") params.set("category", categoryId)
    if (accountId && accountId !== "all") params.set("account", accountId)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)

    const queryString = params.toString()
    window.location.href = `/transactions${queryString ? `?${queryString}` : ""}`
  }

  const handleReset = () => {
    setSearch("")
    setCategoryId("")
    setAccountId("")
    setStartDate("")
    setEndDate("")
    window.location.href = "/transactions"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>거래 필터</DialogTitle>
          <DialogDescription>
            원하는 조건으로 거래 내역을 필터링하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="search">검색어</Label>
            <Input
              id="search"
              placeholder="가맹점명 또는 메모 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
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
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="account">
                <SelectValue placeholder="계정 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">시작일</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">종료일</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <Button onClick={handleApplyFilter}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
