# 달력앱 포터블 사용 가이드

## 📦 다른 곳에서 기존 데이터와 함께 사용하기

### 1. 현재 환경에서 백업하기

#### A. 웹 UI를 통한 백업
1. 달력앱 우상단의 **💾 백업** 버튼 클릭
2. "전체 백업 다운로드" 버튼 클릭
3. `calendar-app-backup-YYYY-MM-DD.json` 파일 다운로드

#### B. 콘솔을 통한 백업 (고급)
```javascript
// 브라우저 콘솔에서 실행
portableBackup.downloadBackup();
```

### 2. 새로운 환경으로 이전하기

#### A. 파일 복사 방법
1. **전체 폴더 복사**: 현재 프로젝트 폴더 전체를 새 위치로 복사
2. **서버 실행**: 새 위치에서 `python -m http.server 8082` 실행
3. **브라우저 접속**: `http://localhost:8082`로 접속

#### B. 개별 파일 구성 (최소 구성)
**필수 파일:**
```
index.html                          (메인 페이지)
style.css                          (기본 스타일)
portable-backup-system.js           (백업 시스템)
backup-system.css                   (백업 UI 스타일)
```

**기능별 파일:**
```
# 메모 시스템
unified-memo-system.js
sticky-unified-restoration.js
memo-deletion-tracker.js

# Google Drive 연동
google-drive-integration.js
unified-cloud-modal.js
google-setup-guide.html

# 기타 기능 파일들...
```

### 3. 데이터 복원하기

#### A. 웹 UI를 통한 복원
1. 새 환경에서 달력앱 접속
2. **💾 백업** 버튼 클릭
3. "백업 파일 선택" 버튼 클릭
4. 이전에 다운로드한 `.json` 파일 선택
5. 자동으로 데이터 복원 및 페이지 새로고침

#### B. 수동 복원 (고급)
```javascript
// 브라우저 콘솔에서 실행
// 1. 파일 선택기 열기
document.getElementById('backupFileInput').click();

// 2. 또는 직접 파일 업로드
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (e) => {
    const file = e.target.files[0];
    portableBackup.restoreFromBackup(file);
};
input.click();
```

## 🔧 다양한 환경 설정

### Windows 환경
```cmd
# Python 서버 실행
cd "달력앱폴더"
python -m http.server 8082

# 또는 Node.js 사용시
npx http-server -p 8082
```

### Mac/Linux 환경
```bash
# Python 서버 실행
cd 달력앱폴더
python3 -m http.server 8082

# 또는 PHP 사용시
php -S localhost:8082
```

### 클라우드 호스팅
- **Netlify**: 폴더를 드래그&드롭으로 업로드
- **Vercel**: Git 연동 또는 CLI로 배포
- **GitHub Pages**: 저장소에 푸시 후 Pages 활성화

## 📊 백업 파일 구조

```json
{
    "version": "1.0.0",
    "timestamp": "2025-09-02T22:48:17.000Z",
    "origin": "http://localhost:8082",
    "data": {
        "memos": [...],                    // 일반 메모
        "calendarMemos": [...],            // 달력 메모
        "stickyMemos": [...],              // 스티키 메모
        "googleAccessToken": "...",        // Google 인증 토큰
        "calendarSettings": {...},         // 달력 설정
        "theme": "...",                    // 테마 설정
        // 기타 모든 localStorage 데이터
    },
    "statistics": {
        "totalMemos": 10,
        "calendarMemos": 5,
        "lastBackup": "2025-09-02T22:48:17.000Z"
    }
}
```

## 🚀 자동화 방법

### 1. 정기 백업 설정
```javascript
// 매일 자동 백업
setInterval(() => {
    portableBackup.downloadBackup();
}, 24 * 60 * 60 * 1000); // 24시간마다

// 로컬스토리지에 백업 시간 기록
localStorage.setItem('lastAutoBackup', new Date().toISOString());
```

### 2. 클라우드 자동 동기화 (Google Drive 연동 시)
```javascript
// 자동 동기화 시작 (5분 간격)
cloudAutoSync.startAutoSync();

// 수동 동기화 실행
cloudAutoSync.manualSync();

// 자동 동기화 중지
cloudAutoSync.stopAutoSync();
```

## ⚠️ 주의사항

1. **포트 충돌**: 8082 포트가 사용 중이면 다른 포트 사용 (8080, 3000 등)
2. **CORS 오류**: file:// 프로토콜 사용 시 일부 기능 제한될 수 있음
3. **Google 인증**: 새 도메인에서는 Google Cloud Console 설정 업데이트 필요
4. **브라우저 캐시**: 데이터 복원 후 브라우저 캐시 삭제 권장

## 🔍 문제 해결

### 데이터가 복원되지 않을 때
1. 브라우저 개발자 도구 → Console 탭에서 오류 확인
2. `portableBackup.validateBackupFile(백업데이터)` 실행하여 파일 유효성 검사
3. localStorage 직접 확인: `localStorage.getItem('memos')`

### Google Drive 연동이 안 될 때
1. Google Cloud Console에서 새 도메인 JavaScript 원본 추가
2. 클라이언트 ID 다시 설정
3. 브라우저 쿠키 삭제

### 서버가 실행되지 않을 때
```bash
# 파이썬 버전 확인
python --version
python3 --version

# 포트 사용 확인
netstat -ano | findstr :8082

# 권한 문제 시 관리자 권한으로 실행
```

## 🚀 자동 동기화 기능

### ✨ 실시간 클라우드 동기화
- **5분 간격 자동 동기화**: Google Drive와 실시간으로 데이터 동기화
- **즉시 동기화**: 메모 작성/수정 시 5초 후 자동 동기화
- **다중 디바이스 지원**: 여러 장치에서 동일한 데이터 사용 가능
- **충돌 해결**: 최신 데이터 우선 적용으로 데이터 손실 방지

### 📱 사용 방법
1. **Google Drive 연결**: "☁️ 구글 드라이브 설정"에서 인증
2. **자동 동기화 활성화**: "💾 백업" → "🚀 자동 동기화 시작"
3. **상태 확인**: 동기화 상태가 실시간으로 표시됨
4. **다른 기기에서 접속**: 자동으로 최신 데이터 동기화

### 🔄 동기화 동작
- **업로드**: 로컬 변경사항을 클라우드에 저장
- **다운로드**: 클라우드의 최신 데이터를 로컬에 적용
- **병합**: 여러 기기의 변경사항을 자동 병합
- **백업**: Google Drive AppData 폴더에 안전하게 저장

## 💡 추가 팁

1. **여러 버전 관리**: 날짜별 백업 파일 여러 개 보관
2. **자동 동기화**: Google Drive 연결 후 자동 동기화 활성화 권장
3. **다중 기기**: 모든 기기에서 동일한 Google 계정으로 로그인
4. **오프라인 사용**: 인터넷 연결 시 자동으로 동기화됨
5. **자동 배포**: GitHub Actions 등으로 자동 배포 구성 가능
6. **모바일 접근**: 같은 네트워크에서 `http://내IP주소:8082`로 접근 가능