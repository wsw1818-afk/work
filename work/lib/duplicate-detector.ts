// lib/duplicate-detector.ts
import { Transaction } from "@prisma/client"
import { NormalizedTransaction } from "./excel-parser"
import { parse, differenceInDays } from "date-fns"

export interface DuplicateCandidate {
  importTx: NormalizedTransaction
  existingTx: Transaction
  score: number // 0~1, 높을수록 중복 가능성 높음
}

/**
 * 중복 거래 감지
 * 기준: 날짜(±1일), 금액(동일), 가맹점(유사)
 */
export function detectDuplicates(
  importTransactions: NormalizedTransaction[],
  existingTransactions: Transaction[]
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = []

  for (const importTx of importTransactions) {
    for (const existingTx of existingTransactions) {
      const score = calculateSimilarityScore(importTx, existingTx)
      if (score >= 0.95) {
        // 95% 이상 유사하면 중복 후보 (날짜 + 금액 + 가맹점이 거의 일치)
        candidates.push({ importTx, existingTx, score })
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score)
}

function calculateSimilarityScore(
  importTx: NormalizedTransaction,
  existingTx: Transaction
): number {
  let score = 0

  // 1. 날짜 유사도 (±1일 허용)
  const dateDiff = Math.abs(
    differenceInDays(
      parse(importTx.date, "yyyy-MM-dd", new Date()),
      parse(existingTx.date, "yyyy-MM-dd", new Date())
    )
  )
  const dateScore = dateDiff <= 1 ? 1 : 0
  score += dateScore * 0.4

  // 2. 금액 일치
  if (importTx.amount === existingTx.amount) {
    score += 0.4
  }

  // 3. 가맹점 유사도 (필수: 가맹점이 유사해야 중복으로 간주)
  if (importTx.merchant && existingTx.merchant) {
    const merchantSimilarity = stringSimilarity(
      importTx.merchant,
      existingTx.merchant
    )
    score += merchantSimilarity * 0.2
  } else {
    // 가맹점 정보가 없으면 중복 가능성 낮음
    return score * 0.5
  }

  return score
}

function stringSimilarity(a: string, b: string): number {
  const lowerA = a.toLowerCase().trim()
  const lowerB = b.toLowerCase().trim()

  if (lowerA === lowerB) return 1
  if (lowerA.includes(lowerB) || lowerB.includes(lowerA)) return 0.8

  // 간단한 Levenshtein 거리 기반 유사도
  const maxLen = Math.max(lowerA.length, lowerB.length)
  const distance = levenshteinDistance(lowerA, lowerB)
  return 1 - distance / maxLen
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}
