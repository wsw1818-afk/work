import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

    // 해당 월의 시작일과 종료일 (문자열 형식)
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`

    // 월별 거래 조회
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        amount: true,
        type: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })

    // 수입/지출 합계 계산
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expense

    // 카테고리별 지출 집계
    const categoryExpenses = transactions
      .filter((t) => t.type === "expense" && t.category)
      .reduce((acc, t) => {
        const categoryId = t.category!.id
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: t.category!,
            amount: 0,
            count: 0,
          }
        }
        acc[categoryId].amount += t.amount
        acc[categoryId].count += 1
        return acc
      }, {} as Record<string, { category: any; amount: number; count: number }>)

    const topCategories = Object.values(categoryExpenses)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // 최근 거래 5건
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        memo: true,
        merchant: true,
        date: true,
        category: {
          select: {
            name: true,
            color: true,
          },
        },
        account: {
          select: {
            name: true,
            type: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    })

    return NextResponse.json({
      period: { year, month },
      summary: {
        income,
        expense,
        balance,
      },
      topCategories,
      recentTransactions,
    })
  } catch (error) {
    console.error("대시보드 요약 조회 오류:", error)
    return NextResponse.json({ error: "대시보드 요약 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
