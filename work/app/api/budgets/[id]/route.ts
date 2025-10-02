import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 예산 조회 및 권한 확인
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    })

    if (!budget) {
      return NextResponse.json(
        { error: "예산을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (budget.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // 예산 삭제
    await prisma.budget.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("예산 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "예산 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
