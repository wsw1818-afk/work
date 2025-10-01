// lib/excel-parser.ts
import * as XLSX from "xlsx"
import { format, parse, isValid } from "date-fns"

export interface ParsedRow {
  [key: string]: string | number | null
}

export interface ColumnMapping {
  source: string // 원본 컬럼명
  target:
    | "date"
    | "amount"
    | "merchant"
    | "memo"
    | "account"
    | "type"
    | "ignore" // 매핑 대상
}

export interface ParseResult {
  headers: string[]
  rows: ParsedRow[]
  rowCount: number
}

/**
 * 엑셀/CSV 파일을 파싱하여 JSON 배열로 반환
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData: ParsedRow[] = XLSX.utils.sheet_to_json(firstSheet, {
    defval: null,
    raw: false, // 날짜를 문자열로 변환
  })

  if (jsonData.length === 0) {
    throw new Error("파일에 데이터가 없습니다.")
  }

  const headers = Object.keys(jsonData[0] || {})

  return {
    headers,
    rows: jsonData,
    rowCount: jsonData.length,
  }
}

/**
 * 컬럼명 기반 자동 매핑 추천
 */
export function suggestColumnMapping(headers: string[]): ColumnMapping[] {
  const mapping: ColumnMapping[] = []

  const datePatterns = [
    "거래일자",
    "사용일자",
    "승인일시",
    "일자",
    "date",
    "거래일",
  ]
  const amountPatterns = [
    "이용금액",
    "금액",
    "승인금액",
    "청구금액",
    "amount",
    "price",
  ]
  const merchantPatterns = [
    "가맹점명",
    "사용처",
    "상호",
    "merchant",
    "store",
    "가맹점",
  ]
  const memoPatterns = ["메모", "비고", "상세", "note", "memo", "description"]
  const accountPatterns = ["카드명", "카드구분", "account", "card", "계좌"]
  const typePatterns = ["취소여부", "승인구분", "type", "거래구분"]

  for (const header of headers) {
    const lowerHeader = header.toLowerCase()

    if (datePatterns.some((p) => lowerHeader.includes(p.toLowerCase()))) {
      mapping.push({ source: header, target: "date" })
    } else if (
      amountPatterns.some((p) => lowerHeader.includes(p.toLowerCase()))
    ) {
      mapping.push({ source: header, target: "amount" })
    } else if (
      merchantPatterns.some((p) => lowerHeader.includes(p.toLowerCase()))
    ) {
      mapping.push({ source: header, target: "merchant" })
    } else if (
      memoPatterns.some((p) => lowerHeader.includes(p.toLowerCase()))
    ) {
      mapping.push({ source: header, target: "memo" })
    } else if (
      accountPatterns.some((p) => lowerHeader.includes(p.toLowerCase()))
    ) {
      mapping.push({ source: header, target: "account" })
    } else if (
      typePatterns.some((p) => lowerHeader.includes(p.toLowerCase()))
    ) {
      mapping.push({ source: header, target: "type" })
    } else {
      mapping.push({ source: header, target: "ignore" })
    }
  }

  return mapping
}

/**
 * 날짜 문자열 정규화 (YYYY-MM-DD 형식으로 변환)
 */
export function normalizeDate(value: any): string | null {
  if (!value) return null

  const str = String(value).trim()

  // 이미 YYYY-MM-DD 형식인 경우
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // YYYY/MM/DD, YYYY.MM.DD 등
  const dateFormats = [
    "yyyy/MM/dd",
    "yyyy.MM.dd",
    "yyyyMMdd",
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
  ]

  for (const fmt of dateFormats) {
    try {
      const parsed = parse(str, fmt, new Date())
      if (isValid(parsed)) {
        return format(parsed, "yyyy-MM-dd")
      }
    } catch {
      continue
    }
  }

  return null
}

/**
 * 금액 문자열 정규화 (정수 KRW로 변환)
 */
export function normalizeAmount(value: any): number {
  if (typeof value === "number") return Math.abs(Math.round(value))

  const str = String(value)
    .trim()
    .replace(/,/g, "") // 쉼표 제거
    .replace(/\s/g, "") // 공백 제거
    .replace(/원/g, "") // '원' 제거

  const num = parseFloat(str)
  if (isNaN(num)) return 0

  return Math.abs(Math.round(num))
}

/**
 * 거래 타입 추론 (expense, income, refund)
 */
export function inferTransactionType(
  amount: number,
  typeHint?: string
): "expense" | "income" | "refund" {
  if (typeHint) {
    const lower = typeHint.toLowerCase()
    if (lower.includes("취소") || lower.includes("환불") || lower.includes("refund")) {
      return "refund"
    }
    if (lower.includes("입금") || lower.includes("수입") || lower.includes("income")) {
      return "income"
    }
  }

  // 기본값: 지출
  return "expense"
}

/**
 * 매핑 적용하여 정규화된 거래 객체 생성
 */
export interface NormalizedTransaction {
  date: string
  amount: number
  type: "expense" | "income" | "refund"
  merchant?: string
  memo?: string
  account?: string
  original: ParsedRow
}

export function applyMapping(
  rows: ParsedRow[],
  mapping: ColumnMapping[]
): NormalizedTransaction[] {
  const result: NormalizedTransaction[] = []

  for (const row of rows) {
    const normalized: Partial<NormalizedTransaction> = {
      original: row,
    }

    let typeHint: string | undefined

    for (const map of mapping) {
      const value = row[map.source]
      if (value === null || value === undefined) continue

      switch (map.target) {
        case "date":
          normalized.date = normalizeDate(value) || undefined
          break
        case "amount":
          normalized.amount = normalizeAmount(value)
          break
        case "merchant":
          normalized.merchant = String(value).trim()
          break
        case "memo":
          normalized.memo = String(value).trim()
          break
        case "account":
          normalized.account = String(value).trim()
          break
        case "type":
          typeHint = String(value)
          break
        default:
          break
      }
    }

    // 필수 필드 검증
    if (!normalized.date || normalized.amount === undefined) {
      continue // 날짜나 금액이 없으면 스킵
    }

    normalized.type = inferTransactionType(normalized.amount, typeHint)

    result.push(normalized as NormalizedTransaction)
  }

  return result
}
