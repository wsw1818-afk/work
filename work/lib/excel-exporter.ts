// lib/excel-exporter.ts
import * as XLSX from "xlsx"
import { Transaction, Category } from "@prisma/client"
import { format } from "date-fns"

interface TransactionWithCategory extends Transaction {
  category: Category | null
  account: { name: string }
}

/**
 * 월별 엑셀 내보내기
 */
export function generateMonthlyExport(
  transactions: TransactionWithCategory[],
  month: string // YYYY-MM
): Buffer {
  const workbook = XLSX.utils.book_new()

  // 1. Summary 시트
  const summaryData = generateSummarySheet(transactions)
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // 2. Transactions 시트
  const transactionsData = generateTransactionsSheet(transactions)
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData)

  // 컬럼 너비 설정
  transactionsSheet["!cols"] = [
    { wch: 12 }, // 날짜
    { wch: 20 }, // 가맹점
    { wch: 12 }, // 카테고리
    { wch: 12 }, // 계정
    { wch: 30 }, // 메모
    { wch: 15 }, // 금액
    { wch: 10 }, // 타입
  ]

  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

/**
 * 일자별 엑셀 내보내기
 */
export function generateDailyExport(
  transactions: TransactionWithCategory[],
  startDate: string,
  endDate: string
): Buffer {
  // 월별과 동일한 구조
  return generateMonthlyExport(transactions, `${startDate}_${endDate}`)
}

function generateSummarySheet(transactions: TransactionWithCategory[]) {
  const categoryMap = new Map<
    string,
    { name: string; total: number; count: number }
  >()

  let totalExpense = 0
  let totalIncome = 0

  for (const tx of transactions) {
    if (tx.type === "expense" && tx.amount > 0) {
      totalExpense += tx.amount

      const catName = tx.category?.name || "미분류"
      const existing = categoryMap.get(catName) || {
        name: catName,
        total: 0,
        count: 0,
      }
      categoryMap.set(catName, {
        name: catName,
        total: existing.total + tx.amount,
        count: existing.count + 1,
      })
    } else if (tx.type === "income") {
      totalIncome += tx.amount
    }
  }

  const categoryRows = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .map((cat) => ({
      카테고리: cat.name,
      지출금액: formatKRW(cat.total),
      거래건수: cat.count,
      비율: `${((cat.total / totalExpense) * 100).toFixed(1)}%`,
    }))

  const summaryRows = [
    { 구분: "총 수입", 금액: formatKRW(totalIncome) },
    { 구분: "총 지출", 금액: formatKRW(totalExpense) },
    { 구분: "순지출", 금액: formatKRW(totalExpense - totalIncome) },
    {},
    { 구분: "=== 카테고리별 지출 ===" },
    ...categoryRows,
  ]

  return summaryRows
}

function generateTransactionsSheet(transactions: TransactionWithCategory[]) {
  return transactions.map((tx) => ({
    날짜: tx.date,
    가맹점: tx.merchant || "-",
    카테고리: tx.category?.name || "미분류",
    계정: tx.account.name,
    메모: tx.memo || "-",
    금액: formatKRW(tx.amount),
    타입: tx.type === "expense" ? "지출" : tx.type === "income" ? "수입" : "환불",
  }))
}

function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}
