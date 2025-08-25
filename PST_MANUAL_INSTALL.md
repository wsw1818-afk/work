# PST 파일 지원 수동 설치 가이드

자동 설치가 실패했을 때 사용하는 수동 설치 방법입니다.

## 방법 1: libpst Windows 바이너리 다운로드

### 단계 1: 파일 다운로드
1. 웹브라우저에서 다음 사이트 방문:
   https://www.five-ten-sg.com/libpst/packages.html

2. **Windows** 섹션에서 다운로드:
   - `libpst-0.6.76-mingw32.zip` 또는 최신 버전

### 단계 2: 설치
1. 다운로드한 zip 파일 압축 해제
2. `bin` 폴더에서 `readpst.exe` 찾기
3. 이 프로그램 폴더에 `tools` 폴더 생성
4. `readpst.exe`를 `tools` 폴더에 복사

### 단계 3: 확인
- `tools/readpst.exe` 파일이 있는지 확인
- 프로그램을 다시 실행

## 방법 2: Windows Subsystem for Linux (WSL) 사용

### WSL 설치 (Windows 10/11)
```bash
wsl --install
```

### PST 도구 설치 (WSL 내부에서)
```bash
sudo apt update
sudo apt install pst-utils
```

### 사용
- WSL에서 PST 파일을 mbox로 변환
- 변환된 파일을 프로그램에서 import

## 방법 3: Microsoft Outlook 설치

가장 간단한 방법입니다:
1. Microsoft Outlook 설치 (Office 365, Office 2019 등)
2. 프로그램이 자동으로 Outlook COM을 사용

## 방법 4: 온라인 변환 도구 (임시 해결책)

### PST를 mbox로 변환하는 온라인 도구 사용:
1. PST 파일을 온라인 도구로 mbox 변환
2. 변환된 mbox 파일을 프로그램에서 가져오기

**주의**: 민감한 데이터는 온라인 도구 사용 자제

## 현재 상황 확인

다음 폴더 구조가 되어야 합니다:
```
프로그램 폴더/
├── mail_backup_manager.py
├── clean_and_run.bat
├── tools/
│   └── readpst.exe  ← 이 파일이 있어야 함
```

## 문제 해결

### 여전히 작동하지 않으면:
1. `tools/readpst.exe` 파일 존재 확인
2. Windows Defender나 바이러스 백신이 차단하지 않는지 확인
3. 관리자 권한으로 실행 시도

### 확인 명령 (명령 프롬프트에서):
```bash
cd /d "프로그램폴더경로"
tools\readpst.exe --help
```

성공하면 readpst 도움말이 표시됩니다.