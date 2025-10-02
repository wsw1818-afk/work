import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { limitAmount } = await request.json()

    if (limitAmount === undefined) {
      return NextResponse.json(
        { error: "예산 금액을 입력해주세요." },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        limitAmount,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(budget)
  } catch (error: any) {
    console.error("예산 수정 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.budget.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("예산 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
