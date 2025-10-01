// app/api/imports/route.ts
import { NextRequest, NextResponse } from "next/server"
import { parseExcelFile, suggestColumnMapping } from "@/lib/excel-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase()
    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".csv")
    ) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다." },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      )
    }

    // 파일 파싱
    const buffer = Buffer.from(await file.arrayBuffer())
    const parseResult = parseExcelFile(buffer)

    // 컬럼 매핑 자동 추천
    const suggestedMapping = suggestColumnMapping(parseResult.headers)

    // 미리보기 데이터 (최대 50행)
    const preview = parseResult.rows.slice(0, 50)

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        headers: parseResult.headers,
        rowCount: parseResult.rowCount,
        preview,
        suggestedMapping,
      },
    })
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: error.message || "파일 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
