import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // YYYY-MM

    if (!month) {
      return NextResponse.json(
        { error: "월 정보가 필요합니다." },
        { status: 400 }
      )
    }

    // 월 형식 검증
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "월 형식은 YYYY-MM이어야 합니다." },
        { status: 400 }
      )
    }

    // 예산 데이터 조회
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month,
      },
      include: {
        category: true,
      },
    })

    // 해당 월의 실제 지출 조회
    const startDate = `${month}-01`
    const year = parseInt(month.split("-")[0])
    const monthNum = parseInt(month.split("-")[1])
    const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0]

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: "expense",
        status: "confirmed",
      },
      include: {
        category: true,
      },
    })

    // 카테고리별 지출 집계
    const spendingByCategory = new Map<string, number>()
    transactions.forEach((tx) => {
      if (tx.categoryId) {
        const current = spendingByCategory.get(tx.categoryId) || 0
        spendingByCategory.set(tx.categoryId, current + tx.amount)
      }
    })

    // 예산 vs 지출 비교 데이터 생성
    const summary = budgets.map((budget) => {
      const spent = spendingByCategory.get(budget.categoryId) || 0
      const remaining = budget.limitAmount - spent
      const percentage = (spent / budget.limitAmount) * 100

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        categoryColor: budget.category.color,
        budgetAmount: budget.limitAmount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentage: Math.min(percentage, 100), // 최대 100%
        status:
          percentage >= 100
            ? "exceeded"
            : percentage >= 80
            ? "warning"
            : "ok",
      }
    })

    // 전체 합계
    const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0)
    const totalSpent = Array.from(spendingByCategory.values()).reduce(
      (sum, amount) => sum + amount,
      0
    )
    const totalRemaining = totalBudget - totalSpent
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return NextResponse.json({
      month,
      categories: summary,
      total: {
        budgetAmount: totalBudget,
        spentAmount: totalSpent,
        remainingAmount: totalRemaining,
        percentage: Math.min(totalPercentage, 100),
        status:
          totalPercentage >= 100
            ? "exceeded"
            : totalPercentage >= 80
            ? "warning"
            : "ok",
      },
    })
  } catch (error: any) {
    console.error("예산 요약 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산 요약을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
