import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        last4: true,
        color: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("계정 조회 오류:", error)
    return NextResponse.json({ error: "계정 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const { name, type, last4, color } = await req.json()

    if (!name || !type) {
      return NextResponse.json({ error: "이름과 유형은 필수입니다." }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        last4,
        color: color || "#3b82f6",
        userId: session.user.id,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("계정 생성 오류:", error)
    return NextResponse.json({ error: "계정 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
