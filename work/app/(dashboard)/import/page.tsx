// app/(dashboard)/import/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

type ColumnMapping = {
  date?: string
  merchant?: string
  amount?: string
  memo?: string
}

type PreviewData = {
  preview: Record<string, any>[]
  suggestedMapping: ColumnMapping
  headers: string[]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setPreviewData(null)
      setImportResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/imports", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "업로드 실패")
      }

      const data: PreviewData = await res.json()
      setPreviewData(data)
      setColumnMapping(data.suggestedMapping)
    } catch (error: any) {
      console.error(error)
      alert(error.message || "업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (!file || !columnMapping.date || !columnMapping.amount) {
      alert("날짜와 금액 컬럼은 필수입니다.")
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mapping", JSON.stringify(columnMapping))

      const res = await fetch("/api/imports/commit", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "가져오기 실패")
      }

      const result = await res.json()
      setImportResult(result)
      setPreviewData(null)
      setFile(null)
    } catch (error: any) {
      console.error(error)
      alert(error.message || "가져오기 실패")
    } finally {
      setImporting(false)
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

      {/* 성공 메시지 */}
      {importResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">가져오기 완료!</p>
                <p className="text-sm text-green-700">
                  {importResult.imported}건 가져오기 완료, {importResult.duplicates}건 중복 제외
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              disabled={uploading || importing}
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
        <CardContent className="space-y-4">
          <Button onClick={handleUpload} disabled={!file || uploading || importing}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "업로드 중..." : "파일 업로드"}
          </Button>

          {previewData && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>미리보기 {previewData.preview.length}건</span>
              </div>

              {/* 컬럼 매핑 */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">컬럼 매핑</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      날짜 컬럼 <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={columnMapping.date}
                      onValueChange={(v) => setColumnMapping({ ...columnMapping, date: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택..." />
                      </SelectTrigger>
                      <SelectContent>
                        {previewData.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">
                      금액 컬럼 <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={columnMapping.amount}
                      onValueChange={(v) => setColumnMapping({ ...columnMapping, amount: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택..." />
                      </SelectTrigger>
                      <SelectContent>
                        {previewData.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">가맹점 컬럼</label>
                    <Select
                      value={columnMapping.merchant}
                      onValueChange={(v) => setColumnMapping({ ...columnMapping, merchant: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_">(없음)</SelectItem>
                        {previewData.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">메모 컬럼</label>
                    <Select
                      value={columnMapping.memo}
                      onValueChange={(v) => setColumnMapping({ ...columnMapping, memo: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_">(없음)</SelectItem>
                        {previewData.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 미리보기 테이블 */}
              <div className="border rounded-lg overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {previewData.headers.map((h) => (
                        <th key={h} className="p-2 text-left font-medium">
                          {h}
                          {columnMapping.date === h && <Badge variant="destructive" className="ml-2 text-xs">날짜</Badge>}
                          {columnMapping.amount === h && <Badge variant="destructive" className="ml-2 text-xs">금액</Badge>}
                          {columnMapping.merchant === h && <Badge variant="secondary" className="ml-2 text-xs">가맹점</Badge>}
                          {columnMapping.memo === h && <Badge variant="secondary" className="ml-2 text-xs">메모</Badge>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t">
                        {previewData.headers.map((h) => (
                          <td key={h} className="p-2">{String(row[h] || "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button onClick={handleImport} disabled={importing || !columnMapping.date || !columnMapping.amount} size="lg">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {importing ? "가져오는 중..." : "가져오기 실행"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>샘플 파일 다운로드</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            샘플 엑셀 파일을 다운로드하여 형식을 참고하세요.
          </p>
          <a href="/sample-card-statement.xlsx" download>
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              샘플 파일 다운로드
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
