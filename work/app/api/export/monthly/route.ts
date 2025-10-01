// app/api/export/monthly/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateMonthlyExport } from "@/lib/excel-exporter"
import { format } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, userId } = body // month: YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "올바른 월 형식이 아닙니다 (YYYY-MM)." },
        { status: 400 }
      )
    }

    // TODO: 실제 사용자 인증
    const actualUserId = userId || "default-user"

    // 해당 월의 시작/종료 날짜
    const [year, monthNum] = month.split("-").map(Number)
    const startDate = `${month}-01`
    const endDate = format(
      new Date(year, monthNum, 0), // 다음 달 0일 = 이번 달 마지막 날
      "yyyy-MM-dd"
    )

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
        { error: "해당 월에 거래 내역이 없습니다." },
        { status: 404 }
      )
    }

    // 엑셀 생성
    const buffer = generateMonthlyExport(transactions, month)

    // 파일 다운로드 응답
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="거래내역_${month}.xlsx"`,
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
