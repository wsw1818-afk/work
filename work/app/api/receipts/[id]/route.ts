import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { unlink } from "fs/promises"
import path from "path"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { ocrText, ocrAmount, ocrDate, ocrConfidence } = body

    // 영수증 조회
    const receipt = await prisma.receipt.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: "영수증을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // OCR 결과 업데이트
    const updatedReceipt = await prisma.receipt.update({
      where: { id: params.id },
      data: {
        ocrText,
        ocrAmount,
        ocrDate,
        ocrConfidence,
      },
    })

    return NextResponse.json(updatedReceipt)
  } catch (error: any) {
    console.error("영수증 업데이트 오류:", error)
    return NextResponse.json(
      { error: error.message || "영수증 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 영수증 조회
    const receipt = await prisma.receipt.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: "영수증을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 파일 삭제 시도 (public/uploads/receipts 경로)
    try {
      if (receipt.url.startsWith("/uploads/receipts/")) {
        const filename = path.basename(receipt.url)
        const filepath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "receipts",
          filename
        )
        await unlink(filepath)
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error)
      // 파일 삭제 실패해도 DB 레코드는 삭제
    }

    // DB에서 삭제
    await prisma.receipt.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("영수증 삭제 오류:", error)
    return NextResponse.json(
      { error: error.message || "영수증 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
