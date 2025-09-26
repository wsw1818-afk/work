# Claude Code Project Setup

## Version Control
* Whenever code changes are made, you must record a one-line description with emoji in korean of the change in `.commit_message.txt` with Edit Tool.
   - Read `.commit_message.txt` first, and then Edit.
   - Overwrite regardless of existing content.
   - If it was a git revert related operation, make the .commit_message.txt file empty.

---

# CLAUDE Guidelines Extension — 초보자 친화형 작업 지침 (for Claude)

> 이 확장 지침은 위 **Version Control** 원문을 유지한 채, Claude가 대화형/에이전트 모드에서
> 일관된 형식과 안전한 개발 흐름을 따르도록 보완합니다.

- 버전: v1.3
- 마지막 업데이트: 2025-09-25

---

## 0) 기본 원칙
- **초보자 우선**: 어려운 용어는 풀어서 설명하고, 단계별로 안내합니다.
- **질문 후 진행**: 정보가 부족하면 **최대 3개의 짧은 확인 질문**만 하고, 합리적 가정을 명시하여 진행합니다.
- **작게, 안전하게**: 한 번에 **하나의 기능/파일** 중심으로 최소 변경을 제안합니다.
- **증거 기반**: 모든 변경은 **테스트/린트/타입체크 로그**로 검증합니다.
- **보안 우선**: 비밀정보/네트워크/의존성 추가는 보수적으로 다룹니다.

---

## 1) 응답 포맷(반드시 이 순서/제목으로 출력)
1. **SUMMARY** — 사용자가 이해할 수 있게 3~5줄 요약  
2. **PLAN** — 체크리스트(필요 파일/변경 범위/테스트 항목)  
3. **PATCH** — **통합 diff(unified diff)**. 파일 경로 포함, 최소 수정만  
4. **COMMANDS_RAN** — 실행한 명령어 목록  
5. **RESULTS** — 각 명령 결과(성공/실패 로그 요약 + 핵심 에러 원문)  
6. **CHECKS** — 린트/타입/테스트/보안/성능/접근성 점검 요약  
7. **NEXT_STEPS** — 사용자가 바로 할 수 있는 다음 행동 3가지

> 대화가 짧더라도 상기 7개 섹션을 항상 포함합니다.

---

## 2) 작업 흐름
1. **계획**: 변경 파일, 영향, 테스트 항목을 **PLAN**에 체크리스트로 제시  
2. **패치**: 전체 재작성 금지. **PATCH**는 최소 diff만 제시  
3. **검증 실행**: 아래 *명령어 매핑*을 따라 **COMMANDS_RAN/RESULTS**에 로그 기록  
   - **테스트 루프**: `테스트 실행 → 실패 로그 인용 → 최소 수정(PATCH) → 재실행`을 **최대 3회** 반복  
   - **종료 조건**: 테스트/린트/타입체크 **모두 통과**해야 완료로 간주  
   - **flaky 완화**: 시드 고정, 타임아웃 상향, 단일 테스트 격리 후 재시도(1회)  
   - **시간 보고**: 총 테스트 실행 시간을 **RESULTS**에 초 단위로 기입  
4. **자체 점검**: **CHECKS**에 품질·보안·성능·접근성 결과 요약  
5. **안내**: **NEXT_STEPS**로 3단계 실행 안내

---

## 3) 도구 사용 규칙 (Claude Tools)
- **Edit Tool**: 파일을 읽고 최소 범위로 수정(diff 제시). 불필요한 대량 리팩터링 금지.
- **Run/Terminal Tool**(있는 경우): 명령 실행은 안전한 기본값 우선(`install/test/lint/typecheck/build`). 위험한 명령은 설명 + 승인을 받고 실행.
- **File I/O**: 대용량 로그/데이터는 요약하고 핵심만 인용. 민감정보는 마스킹.
- **네트워크**: 기본 차단. 외부 API 호출이 필요하면 목적/엔드포인트/에러 처리 방식을 **PLAN**에 먼저 명시하고 승인 후 진행.
- **.commit_message.txt 업데이트는 항상 Edit Tool로 수행**합니다. (상단 Version Control 원칙 준수)

---

## 4) 버전 관리 정책 (확장)
- **코드 변경이 있을 때마다**, 변경 내용을 **이모지 포함 한국어 한 줄**로 `.commit_message.txt`에 기록합니다.  
- 수행 절차(매 변경 시 반복):
  1) `.commit_message.txt` **먼저 읽기**  
  2) **기존 내용과 무관하게 덮어쓰기(Overwrite)**  
  3) **git revert 관련 작업**이었다면 **빈 파일**로 만듭니다.
- 예시(설명용):
  - `✨ 검색 기능 추가: q 파라미터로 서버 필터링 구현`
  - `🐛 버그 수정: 빈 검색어에서 전체 목록 표시`
  - `♻️ 리팩터링: TodoList 상태 로직 커스텀 훅으로 분리`
  - `🔙` *(revert 관련 작업 시 빈 내용으로 저장)*

---

## 5) 명령어 매핑(스택 자동 감지)
> 레포 파일로 스택/도구를 감지하며, 스크립트가 없으면 최소 설정을 제안하고 승인 후 추가합니다.

### 패키지 매니저 자동 감지
- `pnpm-lock.yaml` → **pnpm**
- `yarn.lock` → **yarn**
- `package-lock.json` → **npm**
- 둘 이상 존재 시: 우선순위 `pnpm > yarn > npm`을 제안하고, **1문장 확인 질문** 후 진행

### JavaScript/TypeScript
- 설치: `pnpm install` | `yarn` | `npm install`  
- 개발: `pnpm dev` | `yarn dev` | `npm run dev`  
- 빌드: `pnpm build` | `yarn build` | `npm run build`  
- 테스트: `pnpm test` | `yarn test` | `npm test`  
  - Vitest: `pnpm vitest run` / Jest: `pnpm jest --runInBand`  
  - 단일 케이스: `pnpm vitest run -t "<name>"` / `pnpm jest -t "<name>"`  
- 타입체크: `pnpm typecheck` 또는 `tsc -p .`  
- 린트: `pnpm lint` 또는 `eslint .`

### Python
- 설치: `pip install -r requirements.txt`  
- 테스트: `pytest -q`  (단일: `pytest -q -k "<expr>"`)  
- 린트/포맷: `ruff check .` / `ruff format .`  
- 타입체크: `pyright` 또는 `mypy`

---

## 6) 작업 범위와 금지
- **허용**: `src/`, `app/`, `pages/`, `components/`, `lib/`, `tests/`, `locales/`, `docs/`
- **변경 금지(승인 필요)**: `infra/`, `db/migrations/`, `*secrets*`
- **의존성 추가**: 1~2개 소규모만, 승인 후 진행. 대규모/메이저 업그레이드는 금지.
- **네트워크 호출**: 기본 차단. 목적/엔드포인트를 **PLAN**에 명시하고 승인 후 진행.

---

## 7) 코드 스타일 & 구조
- Prettier/ESLint/Ruff/Black 등 **프로젝트 설정 준수**
- 의미 있는 변수·함수 이름, **왜 그랬는지** 간단 주석
- UI: 접근성 속성(`aria-*`, `alt`) 기본 포함
- i18n 문자열은 **하드코딩 금지**, `locales/`로 관리
- 로그는 비밀정보 마스킹 후 최소화

---

## 8) 테스트 정책
- **TDD 지향**(가능 시 테스트 먼저)
- 단위 + 통합 테스트 **최소 1개** 제시/추가
- 테스트가 없으면 샘플 테스트 추가를 제안하고 승인 후 생성
- 성능/엣지케이스 예시(웹): 응답 < 200ms, 빈/공백/다국어 입력 처리

### 8.1 자동 테스트/수정 루프(에이전트 규칙)
- 모든 작업은 완료 전에 **전체 테스트**를 실행한다.  
- 실패 시 **최소 수정**으로 원인 구간만 고치고 **재실행**한다(최대 3회).  
- 실패 로그는 **원문 일부를 인용**하고, **환경 변수/시간·랜덤/네트워크 의존** 여부를 점검한다.  
- **Flaky**로 판단되면: 시드 고정(`--seed`), 타임아웃 상향, 테스트 격리/리트라이를 제안하고 근본 원인을 기록.  
- 성능 기준(§24) 내에서 **테스트 총 소요 시간**을 RESULTS에 수치로 보고한다.

---

## 9) 보안/개인정보/라이선스
- 비밀키/토큰은 **코드 포함 금지** → `.env` 사용
- 외부 패키지는 유지관리/라이선스 확인 후 **최소 추가**
- 사용자 데이터/로그는 **개인정보 마스킹**

---

## 10) 성능/접근성/SEO(웹)
- 성능: 불필요한 렌더/리렌더 방지, 이미지 최적화, 지연 로딩
- 접근성: 키보드 탐색 가능, 레이블/역할 지정, 대비 준수
- SEO: 메타 태그, 의미론적 마크업, 명확한 링크 텍스트

---

## 11) 사전 승인 필요(고위험 변경)
- 프레임워크 교체/대규모 구조 변경
- 3개 이상 의존성 추가 또는 메이저 업그레이드
- DB 스키마/마이그레이션 변경
- 장기 실행/외부 네트워크 의존 작업

---

## 12) Clarification 트리거
- 목표가 불명확 / API·데이터 계약이 모호 / 성능·보안 제약 불확실  
→ **최대 3문장 질문**을 먼저 한 뒤, 합리적 가정을 **요약해 명시**하고 진행

---

## 13) 오류 대응
- 실패 로그 **원문 인용**(필요 시 일부)
- 원인 가설 → 최소 수정안 → 재검증 계획을 **PLAN**에 갱신 후 재시도
- 같은 실패 2회 이상이면 **대체 경로/우회 전략** 제시

---

## 14) 커밋/PR 규칙
- **커밋 1건 = 1기능(또는 1버그)**
- 제목: `[scope] 요약` (예: `[todos] 검색 기능 추가`)
- 본문: **배경 → 변경점 → 검증(테스트/로그) → 영향/리스크**

---

## 15) 미니 템플릿(입력이 짧아도 작동)
```xml
<goal>한 줄 목표</goal>
<context>관련 파일/폴더</context>
<acceptance>
- 성공 기준 2~3개
</acceptance>
```

---

## 16) 디폴트 가정
- 프론트엔드: React/Next.js + TypeScript
- 백엔드: REST + JSON
- 로케일: ko-KR

---

## 17) 품질 체크리스트(Claude가 **CHECKS**에 표시)
- [ ] 린트/포맷 통과
- [ ] 타입체크 통과
- [ ] 단위/통합 테스트 통과(또는 합리적 사유)
- [ ] 보안(비밀값/로그/의존성) 점검
- [ ] 성능 기준(§24) 검토 + 접근성(A11y) 고려
- [ ] 변경점 문서화

---

## 18) 우선순위/충돌 해결
1. **최신 사용자 지시**
2. **요청에 포함된 수용 기준(acceptance)**
3. **본 CLAUDE.md**
4. **AGENTS.md** (존재할 경우)
5. **레포 내 기타 문서/코드 규칙**
6. **일반 관례**

> 상충 시 위 순서를 따르고, 중요한 충돌은 **SUMMARY**에 명시합니다.

---

## 19) 산출물(출력) 체크
- [ ] 최소 diff(**PATCH**)만 제시(전체 재작성 금지)
- [ ] 실행 명령어와 로그 제공(**COMMANDS_RAN/RESULTS**)
- [ ] 누락/리스크를 **CHECKS**에 요약
- [ ] 사용자용 **NEXT_STEPS** 3가지 제시

---

## 20) AI 도구 활용 정책
- GitHub Copilot / Claude / ChatGPT 등 **AI 제안 코드는 반드시 리뷰 후 채택**합니다.
- 생성된 코드는 **테스트·린트·타입체크 통과** 여부를 RESULTS에 로그로 증명합니다.
- **라이선스/보안 위험**(무단 복제, 취약한 샘플 코드, 하드코딩된 비밀키, `eval` 남용 등) 금지.
- 출처가 모호한 코드 스니펫은 **대체 구현**을 우선 검토합니다.

---

## 21) 명령어 매핑 확장(감지 우선순위)
> §5(명령어 매핑)를 보완하는 세부 규칙입니다.
1. **`package.json`의 `scripts` 우선**: `dev / build / test / lint / typecheck`가 정의돼 있으면 이를 사용.
2. **락파일로 패키지 매니저 결정**: `pnpm-lock.yaml` > `yarn.lock` > `package-lock.json`.
3. **없으면 기본값 제안 후 승인**:
   - JS/TS 기본: `npm run build`, `npm test`, `eslint .`, `tsc -p .`(또는 `pnpm/yarn` 동등 명령)
   - Python 기본: `pytest -q`, `ruff check .`, `ruff format .`, `pyright | mypy`
4. scripts가 비어 있으면, **PLAN에 추가 스크립트 초안**을 제안하고 승인 후 `package.json`에 반영합니다.

---

## 22) 에러 대응 매뉴얼
> §13(오류 대응)을 확장하는 체크리스트입니다. 모든 실패 보고는 **원문 로그 인용 → 원인 가설 → 최소 수정안 → 재검증 계획** 순서로 작성합니다.

- **Network/Permission**
  - 체크: 자격증명(.env), 권한/토큰, 방화벽·프록시, 엔드포인트/HTTP 메서드, CORS(웹)
  - 조치: 재시도(지수 백오프), 타임아웃·에러 핸들링 강화, 민감정보 마스킹 로그
- **Build 실패**
  - 체크: Node/패키지 버전, 락파일 불일치, 중복/순환 의존
  - 조치: 버전 고정, 충돌 패키지 교체, **`pnpm install --frozen-lockfile`**(또는 동등 옵션) 재설치
- **Test 실패**
  - 체크: 환경변수 누락, Mock/Fixture, 시간·랜덤 의존성, 비정상 입력 케이스
  - 조치: 테스트 격리/시드 고정, 경계값 추가, 타임아웃 조정

---

## 23) 팀 협업 정책
- **브랜치 명명**: `feature/<설명>`, `fix/<설명>`, `chore/<설명>`, `refactor/<설명>`
- **코드 리뷰 가이드라인**
  - 우선순위: **정확성 → 보안 → 성능 → 가독성/유지보수성**
  - PR은 **배경 → 변경점 → 검증(로그/스크린샷) → 영향/리스크**를 간단명료하게
  - **불필요한 포맷 변경/대량 이동 금지**(diff 최소화)
- **PR 셀프 체크리스트**
  - [ ] 린트·타입·테스트 통과
  - [ ] 보안(비밀값/로그/의존성) 점검
  - [ ] **성능 기준(§24) 검토** 및 수치 보고
  - [ ] 문서/주석/변경점 요약 포함
  - [ ] 수용 기준(acceptance) 충족 증거 첨부

---

## 24) 성능 기준(경고/리뷰 트리거)
> §10(성능/접근성/SEO)을 수치 기준으로 보완합니다. 초기 성공 빌드에서 **baseline**을 기록하고(PR마다 전/후 비교) 필요시 조정합니다.

- **빌드 시간**: `< 30초` 권고 / `30~60초` 경고 / `> 60초` 리뷰
- **번들 크기**: baseline 대비 `+10%` 초과 시 리뷰( `+25%` 강경 경고 )
- **테스트 전체 실행 시간**: `< 5초` 권고 / `5~15초` 경고 / `> 15초` 리뷰
- 운영 팁:
  - 최초 기준을 `docs/perf-baseline.md`(또는 JSON)로 저장: `{{ buildTime, bundleKB, testTime }}`
  - PR에서는 **RESULTS에 전/후 수치 표**로 보고
  - 필요 시 `size-limit`/번들 분석기 등 **devDependency** 도입 제안(설치 전 승인)

---

## 25) Claude 전용 — 자동 테스트 실행 & 수정 루프
> Claude가 대화형/에이전트 모드에서 이 문서를 따를 때 적용되는 “마무리 체크 규칙”입니다.

### 25.1 실행 원칙
- Claude는 이 문서의 **테스트/타입/린트 명령**을 근거로 작업 종료 전 **프로그램적 체크를 실행**하고, 실패 시 **수정 후 재실행**을 시도한다.  
- 모든 명령은 **Run/Terminal Tool**을 사용해 실행하고, **COMMANDS_RAN/RESULTS**에 로그를 남긴다.  
- Version Control 규칙에 따라 코드 변경 시 **`.commit_message.txt`를 항상 갱신**한다.

### 25.2 실행 템플릿(예시)
```bash
# JS/TS
pnpm install || yarn || npm install
pnpm typecheck || tsc -p .
pnpm lint || eslint .
pnpm test || (pnpm vitest run || pnpm jest --runInBand)

# Python
pip install -r requirements.txt
pyright || mypy
ruff check . && ruff format .
pytest -q
```

### 25.3 실패 대응 빠른 체크
- 환경변수/시계·랜덤/외부 API 의존 여부를 먼저 점검  
- 타임아웃·리트라이·격리로 flaky 완화 후 **근본 원인 수정** 우선

---
