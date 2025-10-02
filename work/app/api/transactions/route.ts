import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = 50
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const account = searchParams.get("account") || undefined
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const where: any = {
      userId: user.id,
      status: "confirmed",
    }

    if (search) {
      where.OR = [
        { merchant: { contains: search } },
        { memo: { contains: search } },
      ]
    }

    if (category) where.categoryId = category
    if (account) where.accountId = account

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
          receipts: true,
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error: any) {
    console.error("거래 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "거래 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { date, merchant, amount, type, categoryId, accountId, memo } = body

    // 필수 필드 검증
    if (!date || !amount || !type || !accountId) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      )
    }

    // 거래 생성
    const transaction = await prisma.transaction.create({
      data: {
        date,
        merchant: merchant || "",
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || null,
        accountId,
        memo: memo || "",
        userId: user.id,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error("거래 추가 오류:", error)
    return NextResponse.json(
      { error: error.message || "거래 추가 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
