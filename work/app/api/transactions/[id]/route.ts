import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        category: true,
        account: true,
        receipts: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "거래를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error("거래 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "거래 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { date, merchant, amount, type, categoryId, accountId, memo, status } =
      body

    // 거래가 사용자 소유인지 확인
    const existing = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "거래를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 거래 수정
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(date && { date }),
        ...(merchant !== undefined && { merchant }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(accountId && { accountId }),
        ...(memo !== undefined && { memo }),
        ...(status && { status }),
      },
      include: {
        category: true,
        account: true,
        receipts: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error("거래 수정 오류:", error)
    return NextResponse.json(
      { error: error.message || "거래 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 거래가 사용자 소유인지 확인
    const existing = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "거래를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 영수증 먼저 삭제 (외래 키 제약 조건)
    await prisma.receipt.deleteMany({
      where: { linkedTxId: params.id },
    })

    // 거래 삭제
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "거래가 삭제되었습니다." })
  } catch (error: any) {
    console.error("거래 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "거래 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
