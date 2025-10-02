// app/layout.tsx
import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "가계부 - Finance Tracker",
  description: "개인 가계부 웹앱",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
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
        </Providers>
      </body>
    </html>
  )
}
