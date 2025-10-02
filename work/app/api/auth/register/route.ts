import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      )
    }

    // 비밀번호 해싱
    const passwordHash = await hash(password, 10)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("회원가입 오류:", error)
    return NextResponse.json(
      { error: error.message || "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
