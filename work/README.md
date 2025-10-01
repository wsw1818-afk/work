# 가계부 (Finance Tracker)

개인 가계부 웹 애플리케이션 - Next.js 14 + Prisma + TypeScript

## 주요 기능

✅ **신용카드 엑셀 파일 업로드** - 자동 컬럼 매핑 및 중복 감지
✅ **월별/일자별 엑셀 내보내기** - Summary + Transactions 시트
✅ **대시보드** - 지출/수입 요약, 카테고리별 차트, 최근 거래
✅ **거래 내역 관리** - 필터, 검색, 페이지네이션
✅ **자동 분류 규칙** - 가맹점명 기반 카테고리 자동 할당
✅ **월별 예산 관리** - 카테고리별 예산 설정 및 초과 경고
🚧 **영수증 업로드/OCR** - 향후 구현 예정
🚧 **태그 시스템** - 향후 구현 예정

---

## 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: Prisma + SQLite (개발) / PostgreSQL (프로덕션)
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Authentication**: NextAuth (단일 사용자 기본)
- **Excel I/O**: SheetJS (xlsx)
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Package Manager**: pnpm

---

## 빠른 시작

### 1. 사전 요구사항

- Node.js 20+
- pnpm 9+

### 2. 설치

\`\`\`bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env

# Prisma 마이그레이션
pnpm prisma:migrate

# 시드 데이터 생성 (샘플 거래 33건)
pnpm prisma:seed
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
pnpm dev
\`\`\`

http://localhost:3000 접속

### 4. 프로덕션 빌드

\`\`\`bash
pnpm build
pnpm start
\`\`\`

---

## 프로젝트 구조

\`\`\`
finance-tracker/
├── app/                      # Next.js 14 App Router
│   ├── (dashboard)/          # 대시보드 레이아웃 그룹
│   │   ├── page.tsx          # 대시보드 (지출/수입 요약)
│   │   ├── transactions/     # 거래 목록
│   │   ├── import/           # 엑셀 가져오기
│   │   ├── receipts/         # 영수증 관리
│   │   └── settings/         # 설정 (규칙/예산)
│   └── api/                  # API 라우트
│       ├── imports/          # 파일 업로드/커밋
│       └── export/           # 엑셀 내보내기
├── lib/                      # 유틸리티
│   ├── excel-parser.ts       # 엑셀 파싱 + 정규화
│   ├── excel-exporter.ts     # 엑셀 생성
│   ├── duplicate-detector.ts # 중복 감지 (Levenshtein)
│   └── prisma.ts             # Prisma 클라이언트
├── components/ui/            # shadcn/ui 컴포넌트
├── prisma/
│   ├── schema.prisma         # 데이터베이스 스키마
│   └── seed.ts               # 시드 데이터
└── tests/                    # 테스트 (향후 추가)
\`\`\`

---

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| \`pnpm dev\` | 개발 서버 실행 (localhost:3000) |
| \`pnpm build\` | 프로덕션 빌드 |
| \`pnpm start\` | 프로덕션 서버 실행 |
| \`pnpm lint\` | ESLint 실행 |
| \`pnpm typecheck\` | TypeScript 타입 체크 |
| \`pnpm test\` | Vitest 유닛 테스트 |
| \`pnpm test:e2e\` | Playwright E2E 테스트 |
| \`pnpm prisma:migrate\` | Prisma 마이그레이션 |
| \`pnpm prisma:seed\` | 시드 데이터 생성 |
| \`pnpm prisma:studio\` | Prisma Studio 실행 |

---

## 데이터 모델

### User (사용자)
- id, email, passwordHash, createdAt

### Account (계정 - 카드/은행/현금)
- id, name, type, last4, color, userId

### Category (카테고리)
- id, name (식비, 교통, 쇼핑 등), color

### Transaction (거래)
- id, date, amount, type (expense/income/refund)
- merchant, memo, categoryId, accountId, status
- tags (JSON array), original (JSON)

### Receipt (영수증 - 향후 구현)
- id, url, mime, ocrText, ocrAmount, linkedTxId

### Rule (자동 분류 규칙)
- id, pattern, field (merchant/memo), assignCategoryId, priority

### Budget (월별 예산)
- id, month (YYYY-MM), categoryId, limitAmount

### ImportFile (가져온 파일 메타)
- id, filename, originalHeaders, rowCount

---

## API 엔드포인트

### POST /api/imports
엑셀/CSV 파일 업로드 → 미리보기 + 컬럼 매핑 자동 추천

**Request (FormData)**:
- \`file\`: .xlsx/.xls/.csv 파일

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "filename": "card-statement.xlsx",
    "headers": ["거래일자", "가맹점명", "이용금액"],
    "rowCount": 125,
    "preview": [...],
    "suggestedMapping": [...]
  }
}
\`\`\`

### POST /api/imports/commit
매핑 적용 후 거래 일괄 저장 (중복 제외)

**Request**:
\`\`\`json
{
  "fileBuffer": "base64...",
  "filename": "card-statement.xlsx",
  "mapping": [
    { "source": "거래일자", "target": "date" },
    { "source": "이용금액", "target": "amount" }
  ],
  "userId": "user-id",
  "accountName": "삼성카드"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "imported": 120,
    "duplicatesSkipped": 5,
    "importFileId": "..."
  }
}
\`\`\`

### POST /api/export/monthly
월별 엑셀 내보내기 (.xlsx 파일 다운로드)

**Request**:
\`\`\`json
{
  "month": "2025-10",
  "userId": "user-id"
}
\`\`\`

**Response**: Excel 파일 (Summary + Transactions 시트)

### POST /api/export/daily
일자별 엑셀 내보내기 (.xlsx 파일 다운로드)

**Request**:
\`\`\`json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "userId": "user-id"
}
\`\`\`

---

## 엑셀 파일 형식

### 입력 예시 (카드 명세서)

| 거래일자 | 가맹점명 | 이용금액 | 카드명 | 메모 |
|---------|---------|---------|--------|------|
| 2025-09-15 | 스타벅스 강남점 | 5,500 | 삼성카드 | 커피 |
| 2025-09-14 | 쿠팡 | 24,900 | 현대카드 | 생활용품 |

- 지원 형식: .xlsx, .xls, .csv
- 컬럼명은 자유롭게 설정 가능 (자동 매핑)
- 날짜 형식: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD 등
- 금액: 쉼표, 공백, "원" 문자 자동 제거

### 출력 예시 (Summary 시트)

| 구분 | 금액 |
|------|------|
| 총 수입 | ₩3,000,000 |
| 총 지출 | ₩856,700 |
| 순지출 | ₩-2,143,300 |

**카테고리별 지출**

| 카테고리 | 지출금액 | 거래건수 | 비율 |
|---------|---------|---------|------|
| 식비 | ₩245,600 | 12 | 28.7% |
| 쇼핑 | ₩195,100 | 6 | 22.8% |

---

## 자동 분류 규칙 예시

시드 데이터에 포함된 규칙:

- "스타벅스" → 카페/간식
- "지하철" → 교통
- "이마트" → 식비
- "CU|GS25" (정규식) → 식비
- "CGV|롯데시네마" → 여가/문화

**규칙 적용 우선순위**: priority 값이 높을수록 먼저 적용됩니다.

---

## 중복 감지 알고리즘

1. **날짜 매칭**: ±1일 허용 (40% 가중치)
2. **금액 일치**: 정확히 동일 (40% 가중치)
3. **가맹점 유사도**: Levenshtein 거리 기반 (20% 가중치)

**중복 판단 기준**: 유사도 70% 이상

---

## 환경 변수 (.env)

\`\`\`env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Single-user mode
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changeme"

# Timezone & Locale
TZ="Asia/Seoul"
NEXT_PUBLIC_LOCALE="ko-KR"
NEXT_PUBLIC_CURRENCY="KRW"
\`\`\`

---

## 프로덕션 배포

### Vercel (권장)

1. GitHub 레포지토리 연결
2. 환경 변수 설정 (DATABASE_URL, NEXTAUTH_SECRET)
3. PostgreSQL 데이터베이스 연결 (Vercel Postgres 또는 Supabase)
4. 자동 배포

### Docker

\`\`\`dockerfile
# Dockerfile (향후 추가 예정)
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm prisma generate
RUN pnpm build
CMD ["pnpm", "start"]
\`\`\`

---

## 문제 해결

### Q: 포트 3000이 이미 사용 중입니다
A: Next.js가 자동으로 3001로 전환합니다. 또는 \`PORT=3001 pnpm dev\`

### Q: Prisma 마이그레이션 실패
A: \`rm -rf prisma/dev.db\` 후 \`pnpm prisma:migrate\` 재실행

### Q: 엑셀 업로드 시 "파일 처리 중 오류"
A: 파일 형식(.xlsx/.xls/.csv) 및 크기(10MB 이하) 확인

### Q: 대시보드에 데이터가 없습니다
A: \`pnpm prisma:seed\` 실행하여 샘플 데이터 생성

---

## 향후 개발 계획

- [ ] 영수증 업로드 + OCR (Tesseract.js)
- [ ] 태그 시스템 (#출장, #가족 등)
- [ ] 거래 필터/검색 고도화
- [ ] 차트 (월별 추이, 카테고리 비교)
- [ ] 다중 사용자 지원 (NextAuth 완전 통합)
- [ ] 모바일 앱 (React Native)
- [ ] Playwright E2E 테스트 추가
- [ ] Vitest 유닛 테스트 추가

---

## 라이선스

MIT

---

## 기여

이슈 및 PR 환영합니다!

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m '✨ Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 제작

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
