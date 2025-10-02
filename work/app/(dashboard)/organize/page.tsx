// app/(dashboard)/organize/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

interface SearchParams {
  page?: string
}

async function getTransactions(userId: string, params: SearchParams) {
  const page = parseInt(params.page || "1")
  const perPage = 50

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        status: "confirmed",
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.transaction.count({ where: { userId, status: "confirmed" } }),
  ])

  return {
    transactions,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }
}

function formatKRW(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export default async function OrganizePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const data = await getTransactions(session.user.id, searchParams)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">가계부 정리</h1>
          <p className="text-muted-foreground">
            불필요한 거래 내역을 삭제하여 가계부를 정리하세요
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래 목록 ({data.total}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>가맹점</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>계정</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.date}</TableCell>
                    <TableCell>{tx.merchant || "-"}</TableCell>
                    <TableCell>
                      {tx.category ? (
                        <Badge variant="outline">{tx.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">미분류</span>
                      )}
                    </TableCell>
                    <TableCell>{tx.account.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.memo || "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        tx.type === "expense"
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {formatKRW(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DeleteTransactionButton
                        transactionId={tx.id}
                        merchant={tx.merchant || "거래"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">거래 내역이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
