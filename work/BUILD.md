# 가계부 앱 빌드 및 배포 가이드

## 📦 Portable 실행 파일 만들기 (설치 불필요)

아무 PC에서나 실행할 수 있는 **단일 실행 파일**을 만들 수 있습니다.

### 1️⃣ 빌드 명령 실행

```bash
npm run electron:build:win
```

⏱️ **소요 시간**: 약 2-5분

### 2️⃣ 생성된 파일 확인

빌드가 완료되면 `dist` 폴더에 다음 파일이 생성됩니다:

```
dist/
  └── 가계부 1.0.0.exe    <- 이 파일을 USB나 클라우드로 공유!
```

### 3️⃣ 배포 및 사용

1. **USB/클라우드 공유**: `가계부 1.0.0.exe` 파일을 USB, Google Drive, Dropbox 등에 복사
2. **다른 PC에서 실행**:
   - 파일을 원하는 폴더에 복사
   - 더블 클릭으로 바로 실행
   - **설치 불필요, 관리자 권한 불필요**

---

## 🔧 빌드 전 확인사항

### ✅ 필수 체크리스트

- [ ] `npm install` 완료
- [ ] `.env` 파일 존재 확인
- [ ] `npm run build` 테스트 (Next.js 빌드 확인)
- [ ] 데이터베이스 마이그레이션 완료 (`npm run prisma:migrate`)

---

## 🌐 다른 플랫폼 빌드

### macOS용 빌드 (Mac에서만 가능)
```bash
npm run electron:build:mac
```
생성 파일: `dist/가계부-1.0.0.dmg`

### Linux용 빌드
```bash
npm run electron:build:linux
```
생성 파일: `dist/가계부-1.0.0.AppImage`

---

## 💾 데이터 위치

Portable 실행 파일을 사용할 때 데이터는 다음 위치에 저장됩니다:

**Windows**:
```
%APPDATA%/가계부/
  └── dev.db    <- 거래내역, 계정 등 모든 데이터
```

**백업 방법**: 위 폴더를 복사하여 안전한 곳에 보관

---

## 🚨 주의사항

### 1. 첫 실행 시
- Windows Defender 경고가 뜰 수 있습니다 (정상)
- "추가 정보" → "실행" 클릭하면 실행됩니다
- **원인**: 코드 서명 인증서가 없기 때문 (무료 앱의 일반적인 현상)

### 2. 데이터 동기화
- 각 PC에서 별도의 데이터베이스를 사용합니다
- 여러 PC에서 같은 데이터를 쓰려면 `dev.db` 파일을 수동으로 복사해야 합니다

### 3. 업데이트
- 새 버전을 만들면 이전 버전을 삭제하고 새 `.exe` 파일로 교체
- 데이터는 유지됩니다 (별도 폴더에 저장되므로)

---

## 🔍 빌드 오류 해결

### "electron-builder 오류"
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### "빌드 타임아웃"
```bash
# 증분 빌드로 재시도
npm run build
npm run electron:build:win
```

### "아이콘 오류"
```bash
# public/icon.png 파일 확인 (256x256 이상 권장)
```

---

## 📊 빌드 파일 크기

| 항목 | 크기 |
|------|------|
| Portable EXE | 약 150-250MB |
| 압축 후 | 약 50-80MB |

**Tip**: 7-Zip으로 압축하면 크기를 50% 이상 줄일 수 있습니다.

---

## ✨ 추가 팁

### 1. 버전 관리
`package.json`에서 버전 수정:
```json
{
  "version": "1.0.1"  // <- 여기 수정
}
```

### 2. 앱 이름 변경
`package.json`의 `build.productName` 수정:
```json
{
  "build": {
    "productName": "내가계부"  // <- 여기 수정
  }
}
```

### 3. 아이콘 변경
- `public/icon.png` 파일 교체 (256x256 PNG 권장)
- 또는 `.ico` 파일 사용 시 `build.win.icon` 경로 수정

---

## 📞 문제 해결

빌드 중 문제가 발생하면:
1. `dist` 폴더 삭제 후 재빌드
2. Node.js 버전 확인 (18.x 이상 권장)
3. 디스크 공간 확인 (최소 2GB 필요)

---

**빌드 완료 후**: `dist/가계부 1.0.0.exe` 파일만 공유하면 어디서든 실행 가능합니다! 🎉
