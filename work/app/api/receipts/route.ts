import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const linkedTxId = formData.get("linkedTxId") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (PNG, JPEG, PDF만 가능)" },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 10MB를 초과할 수 없습니다." },
        { status: 400 }
      )
    }

    // 연결된 거래가 있는 경우 권한 확인
    if (linkedTxId) {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: linkedTxId,
          userId: user.id,
        },
      })

      if (!transaction) {
        return NextResponse.json(
          { error: "거래를 찾을 수 없습니다." },
          { status: 404 }
        )
      }
    }

    // 파일 저장 경로 생성
    const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts")
    await mkdir(uploadDir, { recursive: true })

    // 파일명 생성 (타임스탬프 + 원본 확장자)
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `${timestamp}${ext}`
    const filepath = path.join(uploadDir, filename)

    // 파일 저장
    const buffer = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(buffer))

    // URL 생성
    const tempUrl = `/uploads/receipts/${filename}`

    // 영수증 레코드 생성
    const receipt = await prisma.receipt.create({
      data: {
        url: tempUrl,
        mime: file.type,
        size: file.size,
        linkedTxId: linkedTxId || null,
        userId: user.id,
      },
    })

    return NextResponse.json(receipt, { status: 201 })
  } catch (error: any) {
    console.error("영수증 업로드 오류:", error)
    return NextResponse.json(
      { error: error.message || "영수증 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkedTxId = searchParams.get("linkedTxId") || undefined

    const where: any = {
      userId: user.id,
    }

    if (linkedTxId) {
      where.linkedTxId = linkedTxId
    }

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        linkedTx: true,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    return NextResponse.json(receipts)
  } catch (error: any) {
    console.error("영수증 조회 오류:", error)
    return NextResponse.json(
      { error: error.message || "영수증 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
