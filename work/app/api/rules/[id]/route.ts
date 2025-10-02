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

    const { pattern, field, assignCategoryId, priority } = await request.json()

    if (!pattern || !field || !assignCategoryId) {
      return NextResponse.json(
        { error: "패턴, 필드, 카테고리를 입력해주세요." },
        { status: 400 }
      )
    }

    const rule = await prisma.rule.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        pattern,
        field,
        assignCategoryId,
        priority,
      },
      include: {
        assignCategory: true,
      },
    })

    return NextResponse.json(rule)
  } catch (error: any) {
    console.error("규칙 수정 오류:", error)
    return NextResponse.json(
      { error: error.message || "규칙 수정에 실패했습니다." },
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

    await prisma.rule.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("규칙 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "규칙 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
