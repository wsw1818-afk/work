# PST 파일 처리를 위한 설치 가이드

## Outlook이 없는 환경에서 PST 파일 사용하기

### 방법 1: Python 라이브러리 설치 (권장)

#### Option A: pst-extractor (권장)
```bash
pip install pst-extractor
```

#### Option B: pypff
```bash
pip install pypff
```

### 방법 2: libpst 도구 설치

#### Windows
1. libpst 다운로드: https://www.five-ten-sg.com/libpst/
2. 다운로드한 파일을 압축 해제
3. `readpst.exe`가 있는 폴더를 시스템 PATH에 추가

#### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get install pst-utils

# Mac (Homebrew)
brew install libpst
```

### 방법 3: 간단한 설치 스크립트

`install_pst_support.bat` 파일 실행:
```batch
pip install pst-extractor
```

## 설치 확인

1. 프로그램 실행: `clean_and_run.bat`
2. PST 파일 가져오기 메뉴 선택
3. PST 파일 선택
4. 자동으로 설치된 방법을 사용하여 처리

## 우선순위

프로그램은 다음 순서로 PST 파일 처리를 시도합니다:
1. Python 라이브러리 (pst-extractor 또는 pypff)
2. readpst 도구
3. Outlook COM (Outlook 설치 필요)

## 문제 해결

### "PST 파일을 읽을 수 없습니다" 오류
위의 방법 중 하나 이상을 설치하세요.

### 가장 빠른 해결 방법
```bash
pip install pst-extractor
```

### 설치 후에도 작동하지 않는 경우
1. 명령 프롬프트를 관리자 권한으로 실행
2. `pip install --upgrade pst-extractor` 실행
3. 프로그램 재시작

## 주의사항

- 큰 PST 파일(수 GB)의 경우 처리 시간이 오래 걸릴 수 있습니다
- 충분한 디스크 공간이 필요합니다
- PST 파일이 손상되지 않았는지 확인하세요