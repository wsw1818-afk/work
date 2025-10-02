// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // 1. 사용자 생성
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: await hash("admin123", 10) },
    create: {
      email: "admin@example.com",
      passwordHash: await hash("admin123", 10),
    },
  })
  console.log("✅ User created:", user.email)

  // 2. 카테고리 생성
  const categories = [
    { name: "식비", color: "#ef4444" },
    { name: "카페/간식", color: "#f59e0b" },
    { name: "교통", color: "#3b82f6" },
    { name: "주거/관리", color: "#8b5cf6" },
    { name: "통신", color: "#06b6d4" },
    { name: "쇼핑", color: "#ec4899" },
    { name: "여가/문화", color: "#10b981" },
    { name: "의료", color: "#14b8a6" },
    { name: "교육", color: "#6366f1" },
    { name: "수입", color: "#22c55e" },
    { name: "기타", color: "#6b7280" },
  ]

  const createdCategories = []
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    createdCategories.push(category)
  }
  console.log(`✅ ${createdCategories.length} categories created`)

  // 3. 계정 생성
  const accounts = [
    { name: "삼성카드", type: "card", last4: "1234", color: "#3b82f6" },
    { name: "현대카드", type: "card", last4: "5678", color: "#8b5cf6" },
    { name: "신한은행", type: "bank", color: "#06b6d4" },
    { name: "현금", type: "cash", color: "#10b981" },
  ]

  const createdAccounts = []
  for (const acc of accounts) {
    const account = await prisma.account.create({
      data: {
        ...acc,
        userId: user.id,
      },
    })
    createdAccounts.push(account)
  }
  console.log(`✅ ${createdAccounts.length} accounts created`)

  // 4. 샘플 거래 생성 (최근 30일)
  const today = new Date()
  const transactions = []

  const sampleData = [
    { days: 1, merchant: "스타벅스 강남점", amount: 5500, category: "카페/간식" },
    { days: 1, merchant: "GS25 편의점", amount: 8200, category: "식비" },
    { days: 2, merchant: "지하철", amount: 1400, category: "교통" },
    { days: 3, merchant: "쿠팡", amount: 24900, category: "쇼핑" },
    { days: 3, merchant: "올리브영", amount: 15600, category: "쇼핑" },
    { days: 4, merchant: "이마트", amount: 68400, category: "식비" },
    { days: 5, merchant: "넷플릭스", amount: 13500, category: "여가/문화" },
    { days: 5, merchant: "카카오T 택시", amount: 12800, category: "교통" },
    { days: 6, merchant: "파리바게뜨", amount: 7200, category: "식비" },
    { days: 7, merchant: "CGV 영화관", amount: 28000, category: "여가/문화" },
    { days: 8, merchant: "교보문고", amount: 34500, category: "교육" },
    { days: 9, merchant: "SK텔레콤", amount: 55000, category: "통신" },
    { days: 10, merchant: "아웃백", amount: 48000, category: "식비" },
    { days: 11, merchant: "스타벅스 역삼점", amount: 6500, category: "카페/간식" },
    { days: 12, merchant: "CU 편의점", amount: 4200, category: "식비" },
    { days: 13, merchant: "카카오T 택시", amount: 8900, category: "교통" },
    { days: 14, merchant: "무신사", amount: 89000, category: "쇼핑" },
    { days: 15, merchant: "약국", amount: 12000, category: "의료" },
    { days: 16, merchant: "KT", amount: 49000, category: "통신" },
    { days: 17, merchant: "배달의민족", amount: 18500, category: "식비" },
    { days: 18, merchant: "스타벅스 선릉점", amount: 5800, category: "카페/간식" },
    { days: 19, merchant: "지하철", amount: 1400, category: "교통" },
    { days: 20, merchant: "다이소", amount: 15400, category: "기타" },
    { days: 21, merchant: "쿠팡", amount: 37200, category: "쇼핑" },
    { days: 22, merchant: "투썸플레이스", amount: 7500, category: "카페/간식" },
    { days: 23, merchant: "롯데시네마", amount: 32000, category: "여가/문화" },
    { days: 24, merchant: "이마트24", amount: 6800, category: "식비" },
    { days: 25, merchant: "올리브영", amount: 28900, category: "쇼핑" },
    { days: 26, merchant: "요기요", amount: 21000, category: "식비" },
    { days: 27, merchant: "지하철", amount: 1400, category: "교통" },
    { days: 28, merchant: "스타벅스 삼성점", amount: 6200, category: "카페/간식" },
    { days: 29, merchant: "GS25", amount: 3500, category: "식비" },
    { days: 30, merchant: "월급", amount: 3000000, category: "수입", type: "income" },
  ]

  for (const item of sampleData) {
    const date = new Date(today)
    date.setDate(date.getDate() - item.days)
    const dateStr = date.toISOString().split("T")[0]

    const category = createdCategories.find((c) => c.name === item.category)
    const account =
      createdAccounts[Math.floor(Math.random() * createdAccounts.length)]

    const transaction = await prisma.transaction.create({
      data: {
        date: dateStr,
        merchant: item.merchant,
        amount: item.amount,
        type: item.type || "expense",
        categoryId: category?.id,
        accountId: account.id,
        userId: user.id,
        status: "confirmed",
      },
    })
    transactions.push(transaction)
  }
  console.log(`✅ ${transactions.length} transactions created`)

  // 5. 자동 분류 규칙 생성
  const rules = [
    { pattern: "스타벅스", field: "merchant", category: "카페/간식" },
    { pattern: "투썸", field: "merchant", category: "카페/간식" },
    { pattern: "지하철", field: "merchant", category: "교통" },
    { pattern: "택시", field: "merchant", category: "교통" },
    { pattern: "이마트", field: "merchant", category: "식비" },
    { pattern: "CU|GS25", field: "merchant", category: "식비" },
    { pattern: "쿠팡", field: "merchant", category: "쇼핑" },
    { pattern: "CGV|롯데시네마", field: "merchant", category: "여가/문화" },
    { pattern: "넷플릭스", field: "merchant", category: "여가/문화" },
    { pattern: "SK텔레콤|KT|LG", field: "merchant", category: "통신" },
  ]

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const category = createdCategories.find((c) => c.name === rule.category)
    if (!category) continue

    await prisma.rule.create({
      data: {
        pattern: rule.pattern,
        field: rule.field as "merchant" | "memo",
        assignCategoryId: category.id,
        priority: rules.length - i,
        userId: user.id,
      },
    })
  }
  console.log(`✅ ${rules.length} rules created`)

  // 6. 월별 예산 생성
  const currentMonth = today.toISOString().slice(0, 7) // YYYY-MM

  const budgets = [
    { category: "식비", limit: 500000 },
    { category: "카페/간식", limit: 100000 },
    { category: "교통", limit: 150000 },
    { category: "쇼핑", limit: 300000 },
    { category: "여가/문화", limit: 200000 },
    { category: "통신", limit: 120000 },
  ]

  for (const b of budgets) {
    const category = createdCategories.find((c) => c.name === b.category)
    if (!category) continue

    await prisma.budget.create({
      data: {
        month: currentMonth,
        categoryId: category.id,
        limitAmount: b.limit,
        userId: user.id,
      },
    })
  }
  console.log(`✅ ${budgets.length} budgets created for ${currentMonth}`)

  console.log("🎉 Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
