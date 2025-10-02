import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

// GET /api/recurring - 반복 거래 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive")

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: session.user.id,
        ...(isActive !== null ? { isActive: isActive === "true" } : {}),
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(recurringTransactions)
  } catch (error: any) {
    console.error("반복 거래 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

// POST /api/recurring - 반복 거래 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      amount,
      type,
      merchant,
      memo,
      categoryId,
      accountId,
      frequency,
      dayOfMonth,
      dayOfWeek,
      startDate,
      endDate,
    } = body

    // 필수 필드 검증
    if (!name || !amount || !type || !accountId || !frequency || !startDate) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      )
    }

    // frequency 별 필드 검증
    if (frequency === "monthly" && !dayOfMonth) {
      return NextResponse.json(
        { error: "월별 반복은 dayOfMonth가 필요합니다." },
        { status: 400 }
      )
    }

    if (frequency === "weekly" && dayOfWeek === undefined) {
      return NextResponse.json(
        { error: "주별 반복은 dayOfWeek가 필요합니다." },
        { status: 400 }
      )
    }

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        name,
        amount: parseInt(amount),
        type,
        merchant,
        memo,
        categoryId,
        accountId,
        frequency,
        dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : null,
        startDate,
        endDate,
        userId: session.user.id,
      },
      include: {
        category: true,
        account: true,
      },
    })

    return NextResponse.json(recurringTransaction, { status: 201 })
  } catch (error: any) {
    console.error("반복 거래 생성 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
