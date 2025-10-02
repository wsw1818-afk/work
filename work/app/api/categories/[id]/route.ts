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

    const { name, color } = await request.json()

    if (!name || !color) {
      return NextResponse.json(
        { error: "이름과 색상을 입력해주세요." },
        { status: 400 }
      )
    }

    // 다른 카테고리에서 같은 이름이 있는지 확인
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: params.id },
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "이미 존재하는 카테고리 이름입니다." },
        { status: 409 }
      )
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, color },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("카테고리 수정 오류:", error)
    return NextResponse.json(
      { error: error.message || "카테고리 수정에 실패했습니다." },
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

    // 카테고리를 사용하는 데이터가 있는지 확인
    const [transactionCount, budgetCount, ruleCount] = await Promise.all([
      prisma.transaction.count({ where: { categoryId: params.id } }),
      prisma.budget.count({ where: { categoryId: params.id } }),
      prisma.rule.count({ where: { assignCategoryId: params.id } }),
    ])

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          error: `이 카테고리를 사용하는 거래가 ${transactionCount}개 있습니다. 먼저 거래를 다른 카테고리로 변경해주세요.`,
        },
        { status: 400 }
      )
    }

    if (budgetCount > 0) {
      return NextResponse.json(
        {
          error: `이 카테고리를 사용하는 예산이 ${budgetCount}개 있습니다. 먼저 예산을 삭제해주세요.`,
        },
        { status: 400 }
      )
    }

    if (ruleCount > 0) {
      return NextResponse.json(
        {
          error: `이 카테고리를 사용하는 자동 분류 규칙이 ${ruleCount}개 있습니다. 먼저 규칙을 삭제해주세요.`,
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("카테고리 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "카테고리 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
