// app/(dashboard)/transactions/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { ExportButton } from "@/components/export-button"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { FilterTransactionDialog } from "@/components/filter-transaction-dialog"

export const dynamic = "force-dynamic"

interface SearchParams {
  page?: string
  search?: string
  category?: string
  account?: string
  startDate?: string
  endDate?: string
}

async function getTransactions(params: SearchParams) {
  const page = parseInt(params.page || "1")
  const perPage = 50

  const where: any = {
    status: "confirmed",
  }

  if (params.search) {
    where.OR = [
      { merchant: { contains: params.search } },
      { memo: { contains: params.search } },
    ]
  }

  if (params.category) {
    where.categoryId = params.category
  }

  if (params.account) {
    where.accountId = params.account
  }

  if (params.startDate || params.endDate) {
    where.date = {}
    if (params.startDate) where.date.gte = params.startDate
    if (params.endDate) where.date.lte = params.endDate
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        receipts: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.transaction.count({ where }),
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

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [data, categories, accounts] = await Promise.all([
    getTransactions(searchParams),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">거래 내역</h1>
          <p className="text-muted-foreground">
            총 {data.total}건 (페이지 {data.page}/{data.totalPages})
          </p>
        </div>
        <div className="flex gap-2">
          <FilterTransactionDialog categories={categories} accounts={accounts} />
          <ExportButton transactions={data.transactions} />
          <AddTransactionDialog categories={categories} accounts={accounts} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래 목록</CardTitle>
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
                  <TableHead className="text-center">영수증</TableHead>
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
                      {tx.receipts.length > 0 ? (
                        <Badge variant="secondary">{tx.receipts.length}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                조건에 맞는 거래 내역이 없습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 (간단 버전) */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(data.totalPages, 10) }, (_, i) => (
            <Button
              key={i + 1}
              variant={data.page === i + 1 ? "default" : "outline"}
              size="sm"
              asChild
            >
              <a href={`/transactions?page=${i + 1}`}>{i + 1}</a>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
