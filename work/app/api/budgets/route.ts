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

    const where: any = { userId: session.user.id }
    if (month) {
      where.month = month
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { category: { name: "asc" } },
    })

    return NextResponse.json(budgets)
  } catch (error: any) {
    console.error("예산 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { month, categoryId, limitAmount } = await request.json()

    if (!month || !categoryId || limitAmount === undefined) {
      return NextResponse.json(
        { error: "월, 카테고리, 예산 금액을 입력해주세요." },
        { status: 400 }
      )
    }

    // 월 형식 검증 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "월 형식은 YYYY-MM이어야 합니다." },
        { status: 400 }
      )
    }

    // 중복 체크
    const existing = await prisma.budget.findUnique({
      where: {
        userId_month_categoryId: {
          userId: session.user.id,
          month,
          categoryId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "이미 해당 카테고리에 대한 예산이 설정되어 있습니다." },
        { status: 409 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        month,
        categoryId,
        limitAmount,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    console.error("예산 생성 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
