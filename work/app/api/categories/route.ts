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

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error("카테고리 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "카테고리를 불러오는데 실패했습니다." },
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

    const { name, color } = await request.json()

    if (!name || !color) {
      return NextResponse.json(
        { error: "이름과 색상을 입력해주세요." },
        { status: 400 }
      )
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "이미 존재하는 카테고리 이름입니다." },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: { name, color },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("카테고리 생성 오류:", error)
    return NextResponse.json(
      { error: error.message || "카테고리 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
