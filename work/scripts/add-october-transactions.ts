// scripts/add-october-transactions.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📅 Adding October 2025 transactions...")

  const user = await prisma.user.findFirst({ where: { email: "admin@example.com" } })
  if (!user) {
    console.error("❌ User not found")
    return
  }

  const categories = await prisma.category.findMany()
  const accounts = await prisma.account.findMany({ where: { userId: user.id } })

  if (accounts.length === 0) {
    console.error("❌ No accounts found")
    return
  }

  const octoberData = [
    { date: "2025-10-01", merchant: "스타벅스 강남점", amount: 5500, category: "카페/간식" },
    { date: "2025-10-01", merchant: "GS25 편의점", amount: 8200, category: "식비" },
    { date: "2025-10-02", merchant: "지하철", amount: 1400, category: "교통" },
    { date: "2025-10-03", merchant: "쿠팡", amount: 24900, category: "쇼핑" },
    { date: "2025-10-03", merchant: "올리브영", amount: 15600, category: "쇼핑" },
    { date: "2025-10-04", merchant: "이마트", amount: 68400, category: "식비" },
    { date: "2025-10-05", merchant: "넷플릭스", amount: 13500, category: "여가/문화" },
    { date: "2025-10-05", merchant: "카카오T 택시", amount: 12800, category: "교통" },
    { date: "2025-10-06", merchant: "파리바게뜨", amount: 7200, category: "식비" },
    { date: "2025-10-07", merchant: "CGV 영화관", amount: 28000, category: "여가/문화" },
    { date: "2025-10-08", merchant: "교보문고", amount: 34500, category: "교육" },
    { date: "2025-10-09", merchant: "SK텔레콤", amount: 55000, category: "통신" },
    { date: "2025-10-10", merchant: "아웃백", amount: 48000, category: "식비" },
    { date: "2025-10-11", merchant: "스타벅스 역삼점", amount: 6500, category: "카페/간식" },
    { date: "2025-10-12", merchant: "CU 편의점", amount: 4200, category: "식비" },
    { date: "2025-10-13", merchant: "카카오T 택시", amount: 8900, category: "교통" },
    { date: "2025-10-14", merchant: "무신사", amount: 89000, category: "쇼핑" },
    { date: "2025-10-15", merchant: "약국", amount: 12000, category: "의료" },
  ]

  for (const item of octoberData) {
    const category = categories.find((c) => c.name === item.category)
    const account = accounts[Math.floor(Math.random() * accounts.length)]

    await prisma.transaction.create({
      data: {
        date: item.date,
        amount: item.amount,
        type: "expense",
        merchant: item.merchant,
        status: "confirmed",
        categoryId: category?.id,
        accountId: account.id,
        userId: user.id,
      },
    })
  }

  console.log(`✅ ${octoberData.length} October transactions created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
