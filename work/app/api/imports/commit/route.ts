// app/api/imports/commit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  parseExcelFile,
  applyMapping,
  ColumnMapping,
} from "@/lib/excel-parser"
import { detectDuplicates } from "@/lib/duplicate-detector"

interface CommitRequest {
  fileBuffer: string // base64
  filename: string
  mapping: ColumnMapping[]
  userId: string // 실제로는 NextAuth 세션에서 가져옴
  accountName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CommitRequest = await request.json()

    // TODO: 실제 사용자 인증 구현 필요
    const userId = body.userId || "default-user"

    // 파일 파싱
    const buffer = Buffer.from(body.fileBuffer, "base64")
    const parseResult = parseExcelFile(buffer)

    // 매핑 적용 및 정규화
    const normalized = applyMapping(parseResult.rows, body.mapping)

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
        filename: body.filename,
        originalHeaders: JSON.stringify(parseResult.headers),
        rowCount: normalized.length,
        userId,
      },
    })

    // 계정 찾기 또는 생성
    const accountName = body.accountName || "기본 계정"
    let account = await prisma.account.findFirst({
      where: { userId, name: accountName },
    })

    if (!account) {
      account = await prisma.account.create({
        data: {
          name: accountName,
          type: "card",
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
