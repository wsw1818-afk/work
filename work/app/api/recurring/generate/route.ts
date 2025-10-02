import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { format, addMonths, addWeeks, addYears, parseISO, getDate, getDay } from "date-fns"

// POST /api/recurring/generate - 반복 거래를 실제 거래로 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = format(new Date(), "yyyy-MM-dd")
    const createdTransactions: any[] = []

    // 모든 활성 반복 거래 조회
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        category: true,
        account: true,
      },
    })

    for (const recurring of recurringTransactions) {
      let shouldGenerate = false
      const todayDate = new Date()

      // lastRun이 없으면 startDate부터 시작
      const lastRunDate = recurring.lastRun ? parseISO(recurring.lastRun) : null

      if (recurring.frequency === "monthly") {
        // 월별 반복: dayOfMonth와 오늘 날짜 비교
        if (recurring.dayOfMonth && getDate(todayDate) === recurring.dayOfMonth) {
          // lastRun이 이번 달이 아니면 생성
          if (!lastRunDate || format(lastRunDate, "yyyy-MM") !== format(todayDate, "yyyy-MM")) {
            shouldGenerate = true
          }
        }
      } else if (recurring.frequency === "weekly") {
        // 주별 반복: dayOfWeek와 오늘 요일 비교
        if (recurring.dayOfWeek !== null && getDay(todayDate) === recurring.dayOfWeek) {
          // lastRun이 이번 주가 아니면 생성
          if (
            !lastRunDate ||
            format(lastRunDate, "yyyy-'W'ww") !== format(todayDate, "yyyy-'W'ww")
          ) {
            shouldGenerate = true
          }
        }
      } else if (recurring.frequency === "yearly") {
        // 연별 반복: startDate의 월일과 오늘 월일 비교
        const startDateParsed = parseISO(recurring.startDate)
        if (
          format(todayDate, "MM-dd") === format(startDateParsed, "MM-dd")
        ) {
          // lastRun이 올해가 아니면 생성
          if (!lastRunDate || format(lastRunDate, "yyyy") !== format(todayDate, "yyyy")) {
            shouldGenerate = true
          }
        }
      }

      if (shouldGenerate) {
        // 거래 생성
        const transaction = await prisma.transaction.create({
          data: {
            date: today,
            accountId: recurring.accountId,
            amount: recurring.amount,
            type: recurring.type,
            merchant: recurring.merchant || recurring.name,
            memo: recurring.memo
              ? `${recurring.memo} (자동 생성: ${recurring.name})`
              : `자동 생성: ${recurring.name}`,
            categoryId: recurring.categoryId,
            status: "confirmed",
            userId: session.user.id,
          },
          include: {
            category: true,
            account: true,
          },
        })

        // lastRun 업데이트
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: { lastRun: today },
        })

        createdTransactions.push(transaction)
      }
    }

    return NextResponse.json({
      success: true,
      count: createdTransactions.length,
      transactions: createdTransactions,
    })
  } catch (error: any) {
    console.error("반복 거래 생성 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
