// components/export-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: string
  date: string
  merchant: string | null
  amount: number
  type: string
  memo: string | null
  category: { name: string } | null
  account: { name: string }
}

interface ExportButtonProps {
  transactions: Transaction[]
}

export function ExportButton({ transactions }: ExportButtonProps) {
  const handleExport = () => {
    // CSV 헤더
    const headers = ["날짜", "가맹점", "카테고리", "계정", "유형", "금액", "메모"]

    // CSV 데이터 행 생성
    const rows = transactions.map((tx) => [
      tx.date,
      tx.merchant || "-",
      tx.category?.name || "미분류",
      tx.account.name,
      tx.type === "expense" ? "지출" : "수입",
      tx.amount.toString(),
      tx.memo || "-",
    ])

    // CSV 문자열 생성 (쉼표로 구분, 따옴표로 감싸기)
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
    const bom = "\uFEFF"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })

    // 파일 다운로드
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={transactions.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      내보내기 ({transactions.length}건)
    </Button>
  )
}
