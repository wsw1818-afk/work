import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await prisma.rule.findMany({
      where: { userId: session.user.id },
      include: {
        assignCategory: true,
      },
      orderBy: { priority: "desc" },
    })

    return NextResponse.json(rules)
  } catch (error: any) {
    console.error("규칙 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "규칙을 불러오는데 실패했습니다." },
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

    const { pattern, field, assignCategoryId, priority } = await request.json()

    if (!pattern || !field || !assignCategoryId) {
      return NextResponse.json(
        { error: "패턴, 필드, 카테고리를 입력해주세요." },
        { status: 400 }
      )
    }

    const rule = await prisma.rule.create({
      data: {
        pattern,
        field,
        assignCategoryId,
        priority: priority || 0,
        userId: session.user.id,
      },
      include: {
        assignCategory: true,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error: any) {
    console.error("규칙 생성 오류:", error)
    return NextResponse.json(
      { error: error.message || "규칙 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
