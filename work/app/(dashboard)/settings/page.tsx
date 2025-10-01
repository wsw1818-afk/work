// app/(dashboard)/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          카테고리, 계정, 규칙, 예산 관리 (향후 구현 예정)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            카테고리 추가/수정/삭제 기능은 섹션 4에서 구현됩니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>자동 분류 규칙</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            가맹점명 기반 자동 분류 규칙 설정은 섹션 4에서 구현됩니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>월별 예산</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            카테고리별 월별 예산 설정은 섹션 4에서 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
