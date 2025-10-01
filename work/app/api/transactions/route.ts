import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, merchant, amount, type, categoryId, accountId, memo } = body

    // 필수 필드 검증
    if (!date || !amount || !type || !accountId) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      )
    }

    // 임시: admin 사용자 조회 (인증 시스템 구현 전)
    // TODO: 실제 인증 시스템 구현 후 세션/JWT에서 userId 가져오기
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
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
        userId: adminUser.id,
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
