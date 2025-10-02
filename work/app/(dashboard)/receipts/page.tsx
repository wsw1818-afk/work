"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Image as ImageIcon, FileText, Trash2, Link2, Scan } from "lucide-react"
import { createWorker } from "tesseract.js"

interface Receipt {
  id: string
  url: string
  mime: string
  size: number
  ocrText: string | null
  ocrAmount: number | null
  ocrDate: string | null
  ocrConfidence: number | null
  linkedTxId: string | null
  uploadedAt: string
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      const response = await fetch("/api/receipts")
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error("영수증 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      alert("JPG, PNG, PDF 파일만 업로드 가능합니다.")
      return
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.")
      return
    }

    setSelectedFile(file)

    // 이미지 미리보기
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newReceipt = await response.json()
        setReceipts([newReceipt, ...receipts])
        setSelectedFile(null)
        setPreviewUrl(null)
        alert("영수증이 업로드되었습니다.")
      } else {
        const error = await response.json()
        alert(`업로드 실패: ${error.error}`)
      }
    } catch (error) {
      console.error("업로드 오류:", error)
      alert("업로드 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 영수증을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setReceipts(receipts.filter((r) => r.id !== id))
      } else {
        const error = await response.json()
        alert(`삭제 실패: ${error.error}`)
      }
    } catch (error) {
      console.error("삭제 오류:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleOCR = async (id: string) => {
    const receipt = receipts.find((r) => r.id === id)
    if (!receipt) return

    if (receipt.ocrText) {
      alert("이미 OCR 처리된 영수증입니다.")
      return
    }

    if (receipt.mime === "application/pdf") {
      alert("PDF 파일은 OCR 처리를 지원하지 않습니다.")
      return
    }

    if (!confirm("OCR 처리를 시작하시겠습니까? (처리 시간이 소요될 수 있습니다)")) {
      return
    }

    try {
      console.log("클라이언트 사이드 OCR 시작:", id)

      // 이미지 전처리
      const preprocessedImage = await preprocessImage(receipt.url)

      // 클라이언트에서 Tesseract.js로 OCR 처리
      const worker = await createWorker("kor+eng", 1, {
        logger: (m) => console.log("Tesseract:", m),
      })

      // OCR 정확도 향상을 위한 설정
      await worker.setParameters({
        tessedit_pageseg_mode: "6", // 단일 블록의 균일한 텍스트 (영수증에 최적)
        tessedit_ocr_engine_mode: "1", // LSTM 엔진만 사용 (정확도 향상)
        preserve_interword_spaces: "1", // 단어 간 공백 유지
        tessjs_create_hocr: "0", // HOCR 생성 비활성화 (속도 향상)
        tessjs_create_tsv: "0", // TSV 생성 비활성화 (속도 향상)
      })

      const { data: { text, confidence } } = await worker.recognize(preprocessedImage)
      await worker.terminate()

      console.log("OCR 완료, 신뢰도:", confidence)

      // 금액과 날짜 추출
      const ocrAmount = extractAmount(text)
      const ocrDate = extractDate(text)
      const ocrConfidence = confidence / 100

      // 서버에 결과 저장
      const response = await fetch(`/api/receipts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ocrText: text,
          ocrAmount,
          ocrDate,
          ocrConfidence,
        }),
      })

      if (response.ok) {
        const updatedReceipt = await response.json()
        setReceipts(receipts.map((r) => (r.id === id ? updatedReceipt : r)))
        alert(
          `OCR 처리 완료!\n금액: ${ocrAmount?.toLocaleString() || "없음"}원\n날짜: ${ocrDate || "없음"}\n신뢰도: ${(ocrConfidence * 100).toFixed(1)}%`
        )
      } else {
        const error = await response.json()
        console.error("저장 에러:", error)
        alert(`OCR 결과 저장 실패: ${error.error}`)
      }
    } catch (error: any) {
      console.error("OCR 처리 오류:", error)
      alert(`OCR 처리 중 오류가 발생했습니다.\n\n상세: ${error.message || "알 수 없는 오류"}`)
    }
  }

  // 이미지 전처리 함수 (OCR 정확도 향상)
  async function preprocessImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context를 가져올 수 없습니다."))
          return
        }

        // 원본 크기 유지 (고해상도 유지)
        canvas.width = img.width
        canvas.height = img.height

        // 1. 원본 이미지 그리기
        ctx.drawImage(img, 0, 0)

        // 2. 이미지 데이터 가져오기
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 3. 그레이스케일 변환 및 대비 향상
        for (let i = 0; i < data.length; i += 4) {
          // 그레이스케일 변환
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

          // 대비 향상 (1.5배)
          const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128))

          // 임계값 적용 (이진화) - 밝은 배경, 어두운 텍스트
          const threshold = enhanced > 140 ? 255 : 0

          data[i] = threshold
          data[i + 1] = threshold
          data[i + 2] = threshold
        }

        // 4. 처리된 이미지 데이터 적용
        ctx.putImageData(imageData, 0, 0)

        // 5. Base64로 변환
        resolve(canvas.toDataURL("image/png"))
      }

      img.onerror = () => {
        reject(new Error("이미지 로드 실패"))
      }

      img.src = imageUrl
    })
  }

  // 금액 추출 함수 (개선된 패턴)
  function extractAmount(text: string): number | null {
    // 텍스트 정규화 (공백 제거, 대소문자 통일)
    const normalizedText = text.replace(/\s+/g, " ").toLowerCase()

    const patterns = [
      // 한글 키워드 + 숫자
      /(?:합계|총액|금액|결제금액|카드승인금액|승인금액|total|amount)[:\s=]*[₩＄]?\s*(\d{1,3}(?:[,\.]\d{3})*)/gi,
      // 숫자 + 원
      /(\d{1,3}(?:[,\.]\d{3})*)\s*원/g,
      // 큰 숫자 (최소 1000원 이상)
      /(\d{1,3}[,\.]\d{3}(?:[,\.]\d{3})*)/g,
      // 소수점 포함 (예: 10.00)
      /(\d{1,3}(?:[,\.]\d{3})*(?:\.\d{2})?)/g,
    ]

    const amounts: number[] = []
    for (const pattern of patterns) {
      const matches = normalizedText.matchAll(pattern)
      for (const match of matches) {
        // 쉼표와 점 제거
        const numStr = match[1].replace(/[,\.]/g, "")
        const num = parseInt(numStr, 10)
        // 100원 이상 1억원 이하의 합리적인 금액만 추출
        if (!isNaN(num) && num >= 100 && num <= 100000000) {
          amounts.push(num)
        }
      }
    }

    // 가장 큰 금액 반환 (일반적으로 총액이 가장 큼)
    return amounts.length > 0 ? Math.max(...amounts) : null
  }

  // 날짜 추출 함수 (개선된 패턴)
  function extractDate(text: string): string | null {
    const patterns = [
      // YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD
      /(\d{4})[.-/](\d{1,2})[.-/](\d{1,2})/g,
      // YYYY년 MM월 DD일
      /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g,
      // YY-MM-DD, YY.MM.DD, YY/MM/DD (2자리 연도)
      /(\d{2})[.-/](\d{1,2})[.-/](\d{1,2})/g,
      // MM/DD/YYYY (미국식)
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g,
    ]

    const currentYear = new Date().getFullYear()
    const dates: { date: Date; str: string }[] = []

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        let year: string
        let month: string
        let day: string

        // 패턴에 따라 년/월/일 추출
        if (pattern.source.includes("MM월")) {
          // 한글 패턴
          year = match[1]
          month = match[2].padStart(2, "0")
          day = match[3].padStart(2, "0")
        } else if (match[1].length === 4) {
          // YYYY-MM-DD 형식
          year = match[1]
          month = match[2].padStart(2, "0")
          day = match[3].padStart(2, "0")
        } else if (match[3] && match[3].length === 4) {
          // MM/DD/YYYY 형식 (미국식)
          month = match[1].padStart(2, "0")
          day = match[2].padStart(2, "0")
          year = match[3]
        } else {
          // YY-MM-DD 형식 (2자리 연도)
          const yy = parseInt(match[1], 10)
          const century = Math.floor(currentYear / 100) * 100
          // 현재 연도보다 미래면 이전 세기로 간주
          year = String(yy + century > currentYear ? yy + century - 100 : yy + century)
          month = match[2].padStart(2, "0")
          day = match[3].padStart(2, "0")
        }

        // 유효성 검사
        const monthNum = parseInt(month, 10)
        const dayNum = parseInt(day, 10)
        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          const dateObj = new Date(`${year}-${month}-${day}`)
          if (!isNaN(dateObj.getTime())) {
            // 합리적인 날짜 범위 확인 (과거 10년 ~ 미래 1년)
            const tenYearsAgo = new Date()
            tenYearsAgo.setFullYear(currentYear - 10)
            const oneYearLater = new Date()
            oneYearLater.setFullYear(currentYear + 1)

            if (dateObj >= tenYearsAgo && dateObj <= oneYearLater) {
              dates.push({ date: dateObj, str: `${year}-${month}-${day}` })
            }
          }
        }
      }
    }

    // 가장 최근 날짜 반환
    if (dates.length > 0) {
      dates.sort((a, b) => b.date.getTime() - a.date.getTime())
      return dates[0].str
    }

    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">영수증 관리</h1>
        <p className="text-muted-foreground">
          영수증을 업로드하고 OCR로 자동 분석합니다
        </p>
      </div>

      {/* 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>영수증 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "업로드 중..." : "업로드"}
            </Button>
          </div>

          {/* 미리보기 */}
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">미리보기:</p>
              <img
                src={previewUrl}
                alt="미리보기"
                className="max-w-md max-h-64 object-contain border rounded"
              />
            </div>
          )}

          {selectedFile && !previewUrl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-xs">({formatFileSize(selectedFile.size)})</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 영수증 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>영수증 보관함 ({receipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : receipts.length === 0 ? (
            <p className="text-muted-foreground">업로드된 영수증이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  {/* 아이콘 */}
                  <div className="flex-shrink-0">
                    {receipt.mime.startsWith("image/") ? (
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                    ) : (
                      <FileText className="h-8 w-8 text-gray-500" />
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {formatDate(receipt.uploadedAt)}
                        </p>
                        {receipt.ocrAmount && (
                          <p className="text-lg font-bold text-blue-600">
                            {receipt.ocrAmount.toLocaleString()}원
                          </p>
                        )}
                        {receipt.ocrDate && (
                          <p className="text-xs text-muted-foreground">
                            거래일: {receipt.ocrDate}
                          </p>
                        )}
                        {receipt.ocrConfidence && (
                          <p className="text-xs text-muted-foreground">
                            신뢰도: {(receipt.ocrConfidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        {!receipt.ocrText &&
                          receipt.mime.startsWith("image/") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOCR(receipt.id)}
                              title="OCR 처리"
                            >
                              <Scan className="h-4 w-4" />
                            </Button>
                          )}
                        {receipt.linkedTxId && (
                          <Button size="sm" variant="ghost" disabled>
                            <Link2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(receipt.url, "_blank")}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(receipt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* OCR 텍스트 */}
                    {receipt.ocrText && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          OCR 텍스트 보기
                        </summary>
                        <p className="text-xs mt-1 text-muted-foreground whitespace-pre-wrap">
                          {receipt.ocrText}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
