// app/api/imports/commit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  parseExcelFile,
  applyMapping,
  ColumnMapping,
  extractCardName,
  extractCardNameFromFilename,
} from "@/lib/excel-parser"
import { detectDuplicates } from "@/lib/duplicate-detector"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const mappingStr = formData.get("mapping") as string

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
    }

    // TODO: 실제 사용자 인증 구현 필요
    // 기본 사용자 찾기 또는 생성
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "default@example.com",
          passwordHash: "dummy-hash", // 임시 해시값
        },
      })
    }
    const userId = user.id

    // 파일 파싱 (먼저 헤더 정보 얻기)
    const buffer = Buffer.from(await file.arrayBuffer())
    const parseResult = parseExcelFile(buffer)

    // 매핑 파싱 (객체 -> 배열 변환)
    const mappingObj: Record<string, string> = JSON.parse(mappingStr)
    const mapping: ColumnMapping[] = Object.entries(mappingObj).map(([target, source]) => ({
      source,
      target: target as any,
    }))

    // 출금/입금 컬럼 자동 감지 및 추가 (신한은행 등 분리된 컬럼 처리)
    const headers = parseResult.headers
    for (const header of headers) {
      const lowerHeader = header.toLowerCase()
      // 출금/입금 컬럼이 매핑에 없으면 자동 추가
      if ((lowerHeader.includes("출금") || lowerHeader.includes("입금")) &&
          !mapping.some(m => m.source === header)) {
        mapping.push({ source: header, target: "amount" })
      }
    }

    // 매핑 적용 및 정규화
    const normalized = applyMapping(parseResult.rows, mapping)

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "유효한 거래 데이터가 없습니다." },
        { status: 400 }
      )
    }

    // 기존 거래 조회 (중복 감지용)
    const startDate = normalized[0].date
    const endDate = normalized[normalized.length - 1].date
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // 중복 감지
    const duplicates = detectDuplicates(normalized, existingTransactions)

    // ImportFile 생성
    const importFile = await prisma.importFile.create({
      data: {
        filename: file.name,
        originalHeaders: JSON.stringify(parseResult.headers),
        rowCount: normalized.length,
        userId,
      },
    })

    // 파일명과 파일 내용에서 카드 이름 추출 (파일명 우선)
    const cardNameFromFilename = extractCardNameFromFilename(file.name)
    const cardNameFromContent = extractCardName(buffer)
    const cardName = cardNameFromFilename || cardNameFromContent
    const accountName = cardName || "기본 계정"

    // 계정 타입 결정 (은행 vs 카드)
    const accountType = accountName.includes("은행") ? "bank" : "card"

    // 계정 찾기 또는 생성
    let account = await prisma.account.findFirst({
      where: { userId, name: accountName },
    })

    if (!account) {
      account = await prisma.account.create({
        data: {
          name: accountName,
          type: accountType,
          userId,
        },
      })
    }

    // 거래 일괄 생성 (중복 제외)
    const duplicateIds = new Set(duplicates.map((d) => d.importTx.date + d.importTx.amount))
    const toCreate = normalized.filter(
      (tx) => !duplicateIds.has(tx.date + tx.amount)
    )

    const created = await prisma.transaction.createMany({
      data: toCreate.map((tx) => ({
        date: tx.date,
        amount: tx.amount,
        type: tx.type,
        merchant: tx.merchant,
        memo: tx.memo,
        cardName: cardName, // 파일명에서 추출한 카드 이름 저장
        accountId: account!.id,
        sourceFileId: importFile.id,
        original: JSON.stringify(tx.original),
        status: "confirmed",
        userId,
      })),
    })

    return NextResponse.json({
      success: true,
      data: {
        imported: created.count,
        duplicatesSkipped: duplicates.length,
        importFileId: importFile.id,
      },
    })
  } catch (error: any) {
    console.error("Commit error:", error)
    return NextResponse.json(
      { error: error.message || "거래 저장 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
