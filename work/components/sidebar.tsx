"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Upload, Receipt, Settings, List, RefreshCw, Wallet } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "대시보드", icon: Home },
    { href: "/transactions", label: "거래 내역", icon: List },
    { href: "/budgets", label: "예산 관리", icon: Wallet },
    { href: "/recurring", label: "반복 거래", icon: RefreshCw },
    { href: "/import", label: "가져오기", icon: Upload },
    { href: "/receipts", label: "영수증", icon: Receipt },
    { href: "/settings", label: "설정", icon: Settings },
  ]

  return (
    <aside className="w-64 border-r bg-muted/40">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">가계부</h1>
      </div>
      <nav className="space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent ${
                isActive ? "bg-accent" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
