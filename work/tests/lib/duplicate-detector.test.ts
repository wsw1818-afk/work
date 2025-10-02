import { describe, it, expect } from "vitest"
import { detectDuplicates } from "@/lib/duplicate-detector"
import { Transaction } from "@prisma/client"
import { NormalizedTransaction } from "@/lib/excel-parser"

describe("Duplicate Detector", () => {
  it("should detect exact duplicates", () => {
    const importTx: NormalizedTransaction[] = [
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
    ]

    const existingTx: Partial<Transaction>[] = [
      {
        id: "1",
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
      },
    ]

    const duplicates = detectDuplicates(importTx, existingTx as Transaction[])
    expect(duplicates.length).toBeGreaterThan(0)
  })

  it("should not flag different transactions as duplicates", () => {
    const importTx: NormalizedTransaction[] = [
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
    ]

    const existingTx: Partial<Transaction>[] = [
      {
        id: "2",
        date: "2025-01-16",
        merchant: "투썸플레이스",
        amount: 6000,
        type: "expense" as const,
      },
    ]

    const duplicates = detectDuplicates(importTx, existingTx as Transaction[])
    expect(duplicates.length).toBe(0)
  })

  it("should handle same amount different merchants", () => {
    const importTx: NormalizedTransaction[] = [
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
    ]

    const existingTx: Partial<Transaction>[] = [
      {
        id: "2",
        date: "2025-01-15",
        merchant: "투썸플레이스",
        amount: 5000,
        type: "expense" as const,
      },
    ]

    const duplicates = detectDuplicates(importTx, existingTx as Transaction[])
    // 같은 날, 같은 금액이지만 다른 가맹점은 중복이 아님
    expect(duplicates.length).toBe(0)
  })

  it("should handle same day same merchant different amounts", () => {
    const importTx: NormalizedTransaction[] = [
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
    ]

    const existingTx: Partial<Transaction>[] = [
      {
        id: "2",
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 6000,
        type: "expense" as const,
      },
    ]

    const duplicates = detectDuplicates(importTx, existingTx as Transaction[])
    // 같은 날, 같은 가맹점이지만 금액이 다르면 중복이 아님
    expect(duplicates.length).toBe(0)
  })

  it("should detect duplicates within time window", () => {
    const importTx: NormalizedTransaction[] = [
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
      {
        date: "2025-01-15",
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
        original: {},
      },
    ]

    const existingTx: Partial<Transaction>[] = [
      {
        id: "3",
        date: "2025-01-20", // 5일 후
        merchant: "스타벅스",
        amount: 5000,
        type: "expense" as const,
      },
    ]

    const duplicates = detectDuplicates(importTx, existingTx as Transaction[])
    // 첫 번째 import와 existing은 날짜 차이가 5일이라 중복 아님
    expect(duplicates.length).toBe(0)
  })
})
