// app/api/export/daily/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateDailyExport } from "@/lib/excel-exporter"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, userId } = body // YYYY-MM-DD

    if (
      !startDate ||
      !endDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return NextResponse.json(
        { error: "올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)." },
        { status: 400 }
      )
    }

    // TODO: 실제 사용자 인증
    const actualUserId = userId || "default-user"

    // 거래 조회
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: actualUserId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "confirmed",
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "해당 기간에 거래 내역이 없습니다." },
        { status: 404 }
      )
    }

    // 엑셀 생성
    const buffer = generateDailyExport(transactions, startDate, endDate)

    // 파일 다운로드 응답
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="거래내역_${startDate}_${endDate}.xlsx"`,
      },
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: error.message || "내보내기 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
