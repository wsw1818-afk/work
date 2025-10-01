// components/export-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

export function ExportButton() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (type: "monthly" | "daily") => {
    setExporting(true)
    try {
      const now = new Date()
      const currentMonth = format(now, "yyyy-MM")

      const body = type === "monthly"
        ? { month: currentMonth }
        : { startDate: `${currentMonth}-01`, endDate: format(now, "yyyy-MM-dd") }

      const res = await fetch(`/api/export/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error("내보내기 실패")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transactions_${type === "monthly" ? currentMonth : format(now, "yyyy-MM-dd")}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("내보내기 실패")
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "내보내는 중..." : "내보내기"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("monthly")}>
          월별 내보내기 (이번 달)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("daily")}>
          일별 내보내기 (이번 달)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
