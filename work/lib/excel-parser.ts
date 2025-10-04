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
 * 파일명에서 카드사/은행 이름 추출
 * 예: "신한카드_거래내역.xlsx" -> "신한카드"
 */
export function extractCardNameFromFilename(filename: string): string | null {
  const nameWithoutExt = filename.replace(/\.(xlsx?|csv)$/i, "")

  // 언더스코어 또는 하이픈으로 구분된 첫 번째 부분 추출
  const parts = nameWithoutExt.split(/[_\-]/)
  if (parts.length > 0) {
    const firstPart = parts[0].trim()

    // 카드사/은행 이름 패턴 매칭
    if (firstPart.includes("현대카드") || firstPart.match(/현대.*카드/i)) return "현대카드"
    if (firstPart.includes("신한카드") || firstPart.match(/신한.*카드/i)) return "신한카드"
    if (firstPart.includes("삼성카드") || firstPart.match(/삼성.*카드/i)) return "삼성카드"
    if (firstPart.includes("KB국민카드") || firstPart.includes("국민카드") || firstPart.match(/KB.*카드/i)) return "KB국민카드"
    if (firstPart.includes("롯데카드") || firstPart.match(/롯데.*카드/i)) return "롯데카드"
    if (firstPart.includes("하나카드") || firstPart.match(/하나.*카드/i)) return "하나카드"
    if (firstPart.includes("우리카드") || firstPart.match(/우리.*카드/i)) return "우리카드"
    if (firstPart.includes("NH농협카드") || firstPart.includes("농협카드") || firstPart.match(/NH.*카드/i)) return "NH농협카드"
    if (firstPart.includes("신한은행") || firstPart.match(/신한.*은행/i)) return "신한은행"
    if (firstPart.match(/(KB국민은행|국민은행|우리은행|하나은행|농협은행|NH농협은행)/i)) {
      return firstPart.match(/(KB국민은행|국민은행|우리은행|하나은행|농협은행|NH농협은행)/i)?.[0] || null
    }
  }

  return null
}

/**
 * 엑셀 파일에서 카드 이름 추출
 */
export function extractCardName(buffer: Buffer): string | null {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

  // 모든 행을 배열로 변환 (헤더 없이)
  const allRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    defval: null,
    raw: false,
  })

  // 파일 초반 10행 내에서 카드 이름 찾기
  for (let i = 0; i < Math.min(allRows.length, 10); i++) {
    const row = allRows[i]
    if (!row) continue

    for (const cell of row) {
      const cellStr = String(cell || "").trim()

      // 현대카드 패턴
      if (cellStr.includes("현대카드") || cellStr.match(/현대.*카드/i)) {
        return "현대카드"
      }

      // 신한카드 패턴
      if (cellStr.includes("신한카드") || cellStr.match(/신한.*카드/i)) {
        return "신한카드"
      }

      // 삼성카드 패턴
      if (cellStr.includes("삼성카드") || cellStr.match(/삼성.*카드/i)) {
        return "삼성카드"
      }

      // KB국민카드 패턴
      if (cellStr.includes("KB국민카드") || cellStr.includes("국민카드") || cellStr.match(/KB.*카드/i)) {
        return "KB국민카드"
      }

      // 롯데카드 패턴
      if (cellStr.includes("롯데카드") || cellStr.match(/롯데.*카드/i)) {
        return "롯데카드"
      }

      // 하나카드 패턴
      if (cellStr.includes("하나카드") || cellStr.match(/하나.*카드/i)) {
        return "하나카드"
      }

      // 우리카드 패턴
      if (cellStr.includes("우리카드") || cellStr.match(/우리.*카드/i)) {
        return "우리카드"
      }

      // NH농협카드 패턴
      if (cellStr.includes("NH농협카드") || cellStr.includes("농협카드") || cellStr.match(/NH.*카드/i)) {
        return "NH농협카드"
      }

      // 신한은행 패턴
      if (cellStr.includes("신한은행") || cellStr.match(/신한.*은행/i)) {
        return "신한은행"
      }

      // 기타 은행 패턴들
      if (cellStr.match(/(KB|국민|우리|하나|농협|NH).*은행/i)) {
        return cellStr.match(/(KB국민은행|국민은행|우리은행|하나은행|농협은행|NH농협은행)/i)?.[0] || "은행"
      }
    }
  }

  return null
}

/**
 * 엑셀/CSV 파일을 파싱하여 JSON 배열로 반환
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

  // 모든 행을 배열로 변환 (헤더 없이)
  const allRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    defval: null,
    raw: false,
  })

  if (allRows.length === 0) {
    throw new Error("파일에 데이터가 없습니다.")
  }

  // 헤더 행 찾기: "거래일자" 또는 "날짜" 같은 키워드가 있는 행
  let headerRowIndex = -1
  const headerKeywords = ["거래일자", "거래시간", "적요", "출금", "입금", "날짜", "금액", "사용일자", "이용일", "가맹점명", "이용금액"]

  for (let i = 0; i < Math.min(allRows.length, 10); i++) {
    const row = allRows[i]
    if (row && row.some((cell: any) =>
      headerKeywords.some(keyword =>
        String(cell || "").includes(keyword)
      )
    )) {
      headerRowIndex = i
      break
    }
  }

  // 헤더를 찾지 못한 경우 첫 번째 행을 헤더로 사용
  if (headerRowIndex === -1) {
    headerRowIndex = 0
  }

  const headers = allRows[headerRowIndex].map((h: any) => String(h || "").trim())
  const dataRows = allRows.slice(headerRowIndex + 1)

  // 데이터 행을 객체로 변환
  const jsonData: ParsedRow[] = dataRows
    .filter((row) => row.some((cell) => cell !== null && cell !== ""))
    .map((row) => {
      const obj: ParsedRow = {}
      headers.forEach((header, idx) => {
        if (header) {
          obj[header] = row[idx] || null
        }
      })
      return obj
    })

  if (jsonData.length === 0) {
    throw new Error("유효한 데이터가 없습니다.")
  }

  return {
    headers: headers.filter(h => h), // 빈 헤더 제거
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
    "이용일",
  ]
  const amountPatterns = [
    "이용금액",
    "금액",
    "승인금액",
    "청구금액",
    "amount",
    "price",
    "출금",
    "입금",
  ]
  const merchantPatterns = [
    "가맹점명",
    "사용처",
    "상호",
    "merchant",
    "store",
    "가맹점",
    "내용",
  ]
  const memoPatterns = ["메모", "비고", "상세", "note", "memo", "description", "적요"]
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
    }
  }

  return mapping
}

/**
 * 날짜 문자열을 정규화 (YYYY-MM-DD 형식으로 변환)
 */
export function normalizeDate(value: any): string | null {
  if (!value) return null

  const str = String(value).trim()

  // 1. YYYY-MM-DD 형식 (이미 올바른 형식)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // 2. YYYYMMDD 형식
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
  }

  // 3. YYYY.MM.DD 또는 YYYY/MM/DD 형식
  if (/^\d{4}[./]\d{2}[./]\d{2}$/.test(str)) {
    return str.replace(/[./]/g, "-")
  }

  // 4. MM/DD/YYYY 형식
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [mm, dd, yyyy] = str.split("/")
    return `${yyyy}-${mm}-${dd}`
  }

  // 5. date-fns로 파싱 시도
  const formats = [
    "yyyy-MM-dd",
    "yyyy.MM.dd",
    "yyyy/MM/dd",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
  ]

  for (const fmt of formats) {
    try {
      const parsed = parse(str, fmt, new Date())
      if (isValid(parsed)) {
        return format(parsed, "yyyy-MM-dd")
      }
    } catch {
      // 다음 포맷 시도
    }
  }

  return null
}

/**
 * 금액 문자열을 숫자로 정규화
 */
export function normalizeAmount(value: any): number {
  if (value === null || value === undefined || value === "") return 0

  const str = String(value)
    .replace(/[,\s]/g, "") // 쉼표와 공백 제거
    .replace(/원$/, "") // "원" 제거
    .replace(/^"/, "")  // 현대카드 형식: 앞의 따옴표 제거
    .replace(/"$/, "")  // 현대카드 형식: 뒤의 따옴표 제거
    .trim()

  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/**
 * 거래 유형 추론 (expense/income)
 */
export function inferTransactionType(
  amount: number,
  typeHint?: string,
  columnName?: string
): "expense" | "income" {
  // 1. typeHint가 있으면 우선 사용
  if (typeHint) {
    const lower = typeHint.toLowerCase()
    if (lower.includes("출금") || lower.includes("지출")) return "expense"
    if (lower.includes("입금") || lower.includes("수입")) return "income"
  }

  // 2. columnName 힌트 - 현대카드는 "이용금액" 컬럼 사용
  if (columnName) {
    const lower = columnName.toLowerCase()
    if (lower.includes("출금")) return "expense"
    if (lower.includes("입금")) return "income"

    // 현대카드 "이용금액" 컬럼: 양수=지출, 음수=수입(포인트 사용 등)
    if (lower.includes("이용금액")) {
      return amount >= 0 ? "expense" : "income"
    }
  }

  // 3. 금액 부호 (일반적인 경우: 음수 = 지출, 양수 = 수입)
  if (amount < 0) return "expense"
  if (amount > 0) return "income"

  // 4. 기본값 = 지출
  return "expense"
}

/**
 * 매핑을 적용하여 거래를 정규화
 */
export interface NormalizedTransaction {
  date: string
  amount: number
  type: "expense" | "income"
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
    let amountColumnName: string | undefined
    let 출금금액 = 0
    let 입금금액 = 0

    for (const map of mapping) {
      const value = row[map.source]
      if (value === null || value === undefined) continue

      switch (map.target) {
        case "date":
          normalized.date = normalizeDate(value) || undefined
          break
        case "amount":
          const columnLower = map.source.toLowerCase()
          const amount = normalizeAmount(value)

          // 출금/입금 컬럼 분리 처리
          if (columnLower.includes("출금")) {
            if (amount !== 0) {
              출금금액 = amount
              typeHint = "출금"
              amountColumnName = map.source
            }
          } else if (columnLower.includes("입금")) {
            if (amount !== 0) {
              입금금액 = amount
              typeHint = "입금"
              amountColumnName = map.source
            }
          } else {
            // 단일 금액 컬럼인 경우
            if (amount !== 0 && !normalized.amount) {
              normalized.amount = amount  // 부호 유지 (절대값 제거)
              amountColumnName = map.source
            }
          }
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
          typeHint = String(value).trim()
          break
      }
    }

    // 출금/입금 중 하나만 값이 있는 경우 처리
    if (출금금액 !== 0 || 입금금액 !== 0) {
      normalized.amount = 출금금액 !== 0 ? 출금금액 : 입금금액
      if (!typeHint) {
        typeHint = 출금금액 !== 0 ? "출금" : "입금"
      }
    }

    // 필수 필드 검증
    if (!normalized.date || normalized.amount === undefined || normalized.amount === 0) {
      continue // 날짜나 금액이 없으면 스킵
    }

    normalized.type = inferTransactionType(normalized.amount, typeHint, amountColumnName)

    // 타입 결정 후 금액을 절대값으로 변환
    normalized.amount = Math.abs(normalized.amount)

    result.push(normalized as NormalizedTransaction)
  }

  return result
}
