# PST 파일 대신 MSG 파일 사용하기

readpst 설치가 어려운 경우, PST 파일을 MSG 파일로 변환하여 사용할 수 있습니다.

## 방법 1: Outlook에서 MSG 파일로 내보내기

### Outlook이 설치되어 있는 경우:
1. **PST 파일을 Outlook에 연결**:
   - Outlook 열기
   - 파일 → 데이터 파일 열기 → PST 파일 선택

2. **메일을 MSG 파일로 내보내기**:
   - 내보낼 메일들 선택 (Ctrl+A로 전체 선택 가능)
   - 마우스 우클릭 → "다른 이름으로 저장"
   - 파일 형식: "Outlook 메시지 형식 (*.msg)" 선택
   - 폴더 선택하여 저장

3. **프로그램에서 가져오기**:
   - 메일 백업 관리자 실행
   - "폴더에서 가져오기" 클릭
   - MSG 파일들이 있는 폴더 선택

## 방법 2: PST Viewer 도구 사용

### 무료 PST Viewer 다운로드:
1. "Free PST Viewer" 또는 "SysTools PST Viewer" 검색
2. PST 파일을 열기
3. 메일을 MSG 형식으로 내보내기

## 방법 3: PowerShell 스크립트 (고급)

### Outlook COM을 사용한 자동 변환:
```powershell
# PST를 MSG로 변환하는 PowerShell 스크립트
$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")
$pstFile = "C:\path\to\your\file.pst"
$namespace.AddStore($pstFile)
# 각 메일을 MSG로 저장하는 코드...
```

## 방법 4: 온라인 변환 도구

**주의**: 민감한 데이터는 사용하지 마세요.

1. "PST to MSG converter online" 검색
2. PST 파일을 업로드
3. MSG 파일들을 다운로드
4. 프로그램에서 가져오기

## 현재 프로그램에서 지원하는 기능

### ✅ 이미 지원됨:
- MSG 파일 개별 가져오기
- MSG 파일 대량 가져오기 (폴더 단위)
- EML 파일도 함께 지원

### 사용 방법:
1. **개별 파일**: "파일에서 가져오기" → MSG/EML 파일 선택
2. **대량 파일**: "폴더에서 가져오기" → MSG/EML 파일들이 있는 폴더 선택

## 추천 방법

### 가장 간단한 순서:
1. **Outlook이 있다면**: Outlook에서 PST 열고 → MSG로 내보내기
2. **Outlook이 없다면**: 무료 PST Viewer 사용
3. **기술적 지식이 있다면**: PowerShell 스크립트 작성

## 장점

- readpst 설치 불필요
- Windows 환경에서 안정적으로 작동
- 첨부파일도 함께 보존됨
- 메일별로 개별 처리 가능

## 단점

- PST → MSG 변환 과정 필요
- 대량 메일의 경우 시간 소요
- 폴더 구조 정보 일부 손실 가능