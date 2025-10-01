// app/(dashboard)/layout.tsx
import Link from "next/link"
import { Home, Upload, Receipt, Settings, List } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">가계부</h1>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            대시보드
          </Link>
          <Link
            href="/transactions"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <List className="h-4 w-4" />
            거래 내역
          </Link>
          <Link
            href="/import"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            가져오기
          </Link>
          <Link
            href="/receipts"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Receipt className="h-4 w-4" />
            영수증
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            설정
          </Link>
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-6">
            <h2 className="text-lg font-semibold">Finance Tracker</h2>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
