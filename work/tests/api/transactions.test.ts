import { describe, it, expect, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

describe("Transaction API", () => {
  let userId: string
  let accountId: string
  let categoryId: string

  beforeEach(async () => {
    // 테스트용 사용자 생성 (upsert로 중복 방지)
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        passwordHash: await hash("password123", 10),
      },
    })
    userId = user.id

    // 테스트용 카테고리 생성
    const category = await prisma.category.upsert({
      where: { name: "테스트 카테고리" },
      update: {},
      create: {
        name: "테스트 카테고리",
        color: "#000000",
      },
    })
    categoryId = category.id

    // 테스트용 계정 생성
    const account = await prisma.account.create({
      data: {
        name: "테스트 카드",
        type: "card",
        userId: user.id,
      },
    })
    accountId = account.id
  })

  describe("POST /api/transactions", () => {
    it("should create a new transaction", async () => {
      const transactionData = {
        date: "2025-01-15",
        merchant: "테스트 가맹점",
        amount: 10000,
        type: "expense",
        categoryId,
        accountId,
        memo: "테스트 메모",
      }

      const transaction = await prisma.transaction.create({
        data: {
          ...transactionData,
          userId,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.merchant).toBe("테스트 가맹점")
      expect(transaction.amount).toBe(10000)
      expect(transaction.type).toBe("expense")
    })

    it("should require mandatory fields", async () => {
      const invalidData = {
        merchant: "테스트",
        // date, amount, type, accountId 누락
      }

      await expect(
        prisma.transaction.create({
          data: {
            ...invalidData,
            date: "",
            amount: 0,
            type: "",
            accountId: "",
            userId,
          } as any,
        })
      ).rejects.toThrow()
    })

    it("should handle income transactions", async () => {
      const incomeData = {
        date: "2025-01-15",
        merchant: "급여",
        amount: 3000000,
        type: "income",
        categoryId,
        accountId,
        userId,
      }

      const transaction = await prisma.transaction.create({
        data: incomeData,
      })

      expect(transaction.type).toBe("income")
      expect(transaction.amount).toBe(3000000)
    })
  })

  describe("GET /api/transactions", () => {
    beforeEach(async () => {
      // 테스트 데이터 생성
      await prisma.transaction.createMany({
        data: [
          {
            date: "2025-01-15",
            merchant: "가맹점1",
            amount: 5000,
            type: "expense",
            accountId,
            userId,
            status: "confirmed",
          },
          {
            date: "2025-01-16",
            merchant: "가맹점2",
            amount: 10000,
            type: "expense",
            accountId,
            userId,
            status: "confirmed",
          },
          {
            date: "2025-01-17",
            merchant: "급여",
            amount: 3000000,
            type: "income",
            accountId,
            userId,
            status: "confirmed",
          },
        ],
      })
    })

    it("should retrieve all confirmed transactions", async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          status: "confirmed",
        },
        orderBy: {
          date: "desc",
        },
      })

      expect(transactions).toHaveLength(3)
    })

    it("should filter by date range", async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: "2025-01-15",
            lte: "2025-01-16",
          },
        },
      })

      expect(transactions).toHaveLength(2)
    })

    it("should filter by merchant search", async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          OR: [
            { merchant: { contains: "가맹점1" } },
            { memo: { contains: "가맹점1" } },
          ],
        },
      })

      expect(transactions).toHaveLength(1)
      expect(transactions[0].merchant).toBe("가맹점1")
    })
  })

  describe("PUT /api/transactions/:id", () => {
    it("should update a transaction", async () => {
      const transaction = await prisma.transaction.create({
        data: {
          date: "2025-01-15",
          merchant: "원래 가맹점",
          amount: 5000,
          type: "expense",
          accountId,
          userId,
        },
      })

      const updated = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          merchant: "수정된 가맹점",
          amount: 7000,
        },
      })

      expect(updated.merchant).toBe("수정된 가맹점")
      expect(updated.amount).toBe(7000)
    })

    it("should not update non-existent transaction", async () => {
      await expect(
        prisma.transaction.update({
          where: { id: "non-existent-id" },
          data: { merchant: "테스트" },
        })
      ).rejects.toThrow()
    })
  })

  describe("DELETE /api/transactions/:id", () => {
    it("should delete a transaction", async () => {
      const transaction = await prisma.transaction.create({
        data: {
          date: "2025-01-15",
          merchant: "삭제할 거래",
          amount: 5000,
          type: "expense",
          accountId,
          userId,
        },
      })

      await prisma.transaction.delete({
        where: { id: transaction.id },
      })

      const deleted = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      })

      expect(deleted).toBeNull()
    })
  })
})
