// app/(dashboard)/receipts/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">영수증 관리</h1>
        <p className="text-muted-foreground">
          영수증 업로드 및 OCR 기능 (향후 구현 예정)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>영수증 보관함</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            이 페이지는 섹션 4에서 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
