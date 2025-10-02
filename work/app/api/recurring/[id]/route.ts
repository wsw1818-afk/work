import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

// GET /api/recurring/[id] - 특정 반복 거래 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        category: true,
        account: true,
      },
    })

    if (!recurringTransaction) {
      return NextResponse.json(
        { error: "반복 거래를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json(recurringTransaction)
  } catch (error: any) {
    console.error("반복 거래 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 조회에 실패했습니다." },
      { status: 500 }
    )
  }
}

// PATCH /api/recurring/[id] - 반복 거래 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
    } = body

    const recurringTransaction = await prisma.recurringTransaction.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount: parseInt(amount) }),
        ...(type !== undefined && { type }),
        ...(merchant !== undefined && { merchant }),
        ...(memo !== undefined && { memo }),
        ...(categoryId !== undefined && { categoryId }),
        ...(accountId !== undefined && { accountId }),
        ...(frequency !== undefined && { frequency }),
        ...(dayOfMonth !== undefined && {
          dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
        }),
        ...(dayOfWeek !== undefined && {
          dayOfWeek: dayOfWeek !== null ? parseInt(dayOfWeek) : null,
        }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
        account: true,
      },
    })

    return NextResponse.json(recurringTransaction)
  } catch (error: any) {
    console.error("반복 거래 수정 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/recurring/[id] - 반복 거래 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.recurringTransaction.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("반복 거래 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "반복 거래 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
