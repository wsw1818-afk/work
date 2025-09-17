@echo off
chcp 65001 >nul

cd /d "%~dp0"

REM 기존 서버 종료 (포트 8082 사용 중인 프로세스 종료)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Node.js 서버로 자동 시작 (백그라운드 실행)
node --version >nul 2>&1
if %errorlevel% == 0 (
    REM Node.js 서버를 백그라운드로 실행 (창 최소화)
    start /min cmd /c "node server.js"
    
    REM 2초 대기 (서버 시작 시간)
    timeout /t 2 /nobreak >nul
    
    REM 브라우저 자동 열기
    start "" "http://localhost:8082"
    exit
) else (
    REM Python 서버 대체 실행
    python --version >nul 2>&1
    if %errorlevel% == 0 (
        start /min cmd /c "python -m http.server 8000"
        timeout /t 2 /nobreak >nul
        start "" "http://localhost:8000"
        exit
    ) else (
        REM 서버가 없으면 직접 HTML 파일 열기
        start "" "index.html"
        exit
    )
)