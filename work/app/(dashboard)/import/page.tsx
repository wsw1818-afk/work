// app/(dashboard)/import/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileSpreadsheet } from "lucide-react"
import { useState } from "react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // TODO: 실제 업로드 로직 구현 (섹션 4에서)
      console.log("Uploading:", file.name)
      alert("업로드 기능은 다음 섹션에서 구현됩니다.")
    } catch (error) {
      console.error(error)
      alert("업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">엑셀 가져오기</h1>
        <p className="text-muted-foreground">
          신용카드 또는 은행 거래 내역을 업로드하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1단계: 파일 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            지원 형식: Excel (.xlsx, .xls), CSV (.csv)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2단계: 업로드 및 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "업로드 중..." : "파일 업로드"}
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            파일을 업로드하면 데이터 미리보기와 컬럼 매핑 화면이 표시됩니다.
            <br />
            (이 기능은 섹션 4에서 구현됩니다)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>샘플 파일 형식</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">거래일자</th>
                  <th className="p-2 text-left">가맹점명</th>
                  <th className="p-2 text-right">이용금액</th>
                  <th className="p-2 text-left">카드명</th>
                  <th className="p-2 text-left">메모</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">2025-09-15</td>
                  <td className="p-2">스타벅스 강남점</td>
                  <td className="p-2 text-right">5,500</td>
                  <td className="p-2">삼성카드</td>
                  <td className="p-2">커피</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">2025-09-14</td>
                  <td className="p-2">쿠팡</td>
                  <td className="p-2 text-right">24,900</td>
                  <td className="p-2">현대카드</td>
                  <td className="p-2">생활용품</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            위와 같은 형식의 엑셀 파일을 준비해주세요. 컬럼 이름은 자유롭게
            설정 가능하며, 업로드 시 자동으로 매핑됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
