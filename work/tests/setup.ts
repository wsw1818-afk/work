import { beforeAll, afterAll, afterEach } from "vitest"
import { prisma } from "@/lib/prisma"

// 테스트 전 데이터베이스 초기화
beforeAll(async () => {
  // 테스트용 데이터베이스 마이그레이션
  console.log("테스트 환경 설정 중...")
})

// 각 테스트 후 데이터 정리
afterEach(async () => {
  // 트랜잭션 롤백 또는 데이터 삭제
  await prisma.transaction.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.account.deleteMany()
  await prisma.importFile.deleteMany()
  await prisma.rule.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
})

// 모든 테스트 종료 후 연결 해제
afterAll(async () => {
  await prisma.$disconnect()
})
