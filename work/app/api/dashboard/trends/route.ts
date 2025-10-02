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
    const months = parseInt(searchParams.get("months") || "6")

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    // 월별로 그룹화
    const monthlyData: Record<
      string,
      { income: number; expense: number }
    > = {}

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData[key] = { income: 0, expense: 0 }
    }

    transactions.forEach((tx) => {
      const date = new Date(tx.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (monthlyData[key]) {
        if (tx.type === "income") {
          monthlyData[key].income += tx.amount
        } else {
          monthlyData[key].expense += tx.amount
        }
      }
    })

    const result = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("월별 트렌드 조회 실패:", error)
    return NextResponse.json(
      { error: "월별 트렌드 조회 실패" },
      { status: 500 }
    )
  }
}
