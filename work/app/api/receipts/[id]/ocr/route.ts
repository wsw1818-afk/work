import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import Tesseract from "tesseract.js"
import path from "path"
import { readFile } from "fs/promises"

// 금액 추출 함수
function extractAmount(text: string): number | null {
  // 한글 "원" 앞의 숫자 패턴
  const patterns = [
    /(\d{1,3}(?:,\d{3})*)\s*원/g, // 1,000원
    /금액[:\s]*(\d{1,3}(?:,\d{3})*)/g, // 금액: 1,000
    /합계[:\s]*(\d{1,3}(?:,\d{3})*)/g, // 합계: 1,000
    /total[:\s]*(\d{1,3}(?:,\d{3})*)/gi, // Total: 1,000
  ]

  const amounts: number[] = []

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, "")
      const num = parseInt(numStr, 10)
      if (!isNaN(num) && num > 0) {
        amounts.push(num)
      }
    }
  }

  // 가장 큰 금액을 반환 (일반적으로 합계가 가장 큼)
  return amounts.length > 0 ? Math.max(...amounts) : null
}

// 날짜 추출 함수
function extractDate(text: string): string | null {
  const patterns = [
    /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/g, // 2024-01-15, 2024.01.15
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g, // 2024년 01월 15일
    /(\d{2})[.-](\d{1,2})[.-](\d{1,2})/g, // 24-01-15, 24.01.15
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (match) {
      let year = match[1]
      const month = match[2].padStart(2, "0")
      const day = match[3].padStart(2, "0")

      // 2자리 연도를 4자리로 변환
      if (year.length === 2) {
        const currentYear = new Date().getFullYear()
        const century = Math.floor(currentYear / 100) * 100
        year = String(century + parseInt(year, 10))
      }

      // 유효한 날짜인지 검증
      const date = new Date(`${year}-${month}-${day}`)
      if (!isNaN(date.getTime())) {
        return `${year}-${month}-${day}`
      }
    }
  }

  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 영수증 조회
    const receipt = await prisma.receipt.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: "영수증을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 이미 OCR 처리된 경우
    if (receipt.ocrText) {
      return NextResponse.json(
        { error: "이미 OCR 처리된 영수증입니다." },
        { status: 400 }
      )
    }

    // PDF는 OCR 불가
    if (receipt.mime === "application/pdf") {
      return NextResponse.json(
        { error: "PDF 파일은 OCR 처리를 지원하지 않습니다." },
        { status: 400 }
      )
    }

    // 파일 경로 확인
    if (!receipt.url.startsWith("/uploads/receipts/")) {
      return NextResponse.json(
        { error: "유효하지 않은 파일 경로입니다." },
        { status: 400 }
      )
    }

    const filename = path.basename(receipt.url)
    const filepath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "receipts",
      filename
    )

    // 파일 읽기
    let imageBuffer: Buffer
    try {
      imageBuffer = await readFile(filepath)
    } catch (error) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Tesseract.js로 OCR 처리
    console.log("OCR 처리 시작:", params.id)
    let text = ""
    let ocrAmount: number | null = null
    let ocrDate: string | null = null
    let ocrConfidence = 0

    try {
      // Tesseract.recognize()를 직접 사용 (worker 없이)
      console.log("OCR 인식 시작...")
      const result = await Tesseract.recognize(imageBuffer, "kor+eng", {
        logger: (m) => console.log("Tesseract:", m),
      })
      console.log("OCR 처리 완료, 신뢰도:", result.data.confidence)

      // 텍스트에서 금액과 날짜 추출
      text = result.data.text
      ocrAmount = extractAmount(text)
      ocrDate = extractDate(text)
      ocrConfidence = result.data.confidence / 100 // 0~1 범위로 변환

      console.log("추출 결과 - 금액:", ocrAmount, "날짜:", ocrDate)
    } catch (ocrError: any) {
      console.error("Tesseract OCR 에러:", ocrError)
      throw new Error(`OCR 처리 실패: ${ocrError.message}`)
    }

    // DB 업데이트
    const updatedReceipt = await prisma.receipt.update({
      where: { id: params.id },
      data: {
        ocrText: text,
        ocrAmount,
        ocrDate,
        ocrConfidence,
      },
    })

    return NextResponse.json(updatedReceipt)
  } catch (error: any) {
    console.error("OCR 처리 오류:", error)
    return NextResponse.json(
      { error: error.message || "OCR 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
