@echo off
chcp 65001 > nul
echo ========================================
echo   가계부 앱 개발 서버 시작
echo ========================================
echo.

cd /d "%~dp0\work\work"

echo [1/3] 의존성 설치 확인 중...
if not exist "node_modules" (
    echo node_modules 없음 - 설치 시작...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 설치 실패! Node.js가 설치되어 있는지 확인하세요.
        pause
        exit /b 1
    )
)

echo [2/3] 기존 서버 정리 중...
REM 포트 3000 사용 프로세스만 안전하게 종료
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
    echo    ⏹️  기존 서버 종료 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)
ping 127.0.0.1 -n 2 >nul
echo ✅ 포트 정리 완료!

echo [3/3] 개발 서버 시작 중...
echo.

REM 개발 서버를 백그라운드에서 실행
start /B npm run dev

REM 서버가 완전히 시작될 때까지 대기 (8초)
echo ⏳ 서버 준비 중...
echo    잠시만 기다려주세요 (약 8초)
ping 127.0.0.1 -n 9 >nul

echo.
echo ========================================
echo   ✅ 서버 준비 완료!
echo   📱 브라우저: http://localhost:3000
echo   ⏹️  종료: Ctrl+C 후 이 창 닫기
echo ========================================
echo.

REM 브라우저 열기
start "" http://localhost:3000

echo 📋 서버가 실행 중입니다.
echo    브라우저에서 가계부 앱을 사용하세요.
echo.
echo ⚠️  종료하려면 Ctrl+C를 누른 후 이 창을 닫으세요.
echo.
pause
