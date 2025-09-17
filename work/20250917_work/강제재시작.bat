@echo off
chcp 65001 >nul
cls

echo ========================================
echo  🔧 서버 강제 재시작 (COOP 정책 제거)
echo ========================================
echo.

REM 1. 모든 Node.js 프로세스 종료
echo [1/4] 기존 Node.js 프로세스 종료 중...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM 2초 대기
timeout /t 2 /nobreak >nul

REM 2. 디렉토리 이동
cd /d "%~dp0"

REM 3. 브라우저 캐시 클리어를 위한 메시지
echo [2/4] 브라우저 캐시 클리어 권장...
echo        (Ctrl+Shift+R 또는 Ctrl+F5로 강력 새로고침)
echo.

REM 4. 새 서버 실행 (COOP 정책 제거 버전)
echo [3/4] 새 서버 시작 중 (COOP 정책 제거)...
start /min cmd /c "node server-nocoop.js"

REM 3초 대기 (서버 완전 시작)
timeout /t 3 /nobreak >nul

REM 5. 브라우저 열기 (시크릿 모드로 캐시 없이)
echo [4/4] 브라우저 열기...
echo.

REM Chrome 시크릿 모드로 열기 시도
start chrome --incognito "http://localhost:8081" 2>nul
if %errorlevel% neq 0 (
    REM Chrome이 없으면 Edge InPrivate 모드로 시도
    start msedge --inprivate "http://localhost:8081" 2>nul
    if %errorlevel% neq 0 (
        REM 기본 브라우저로 열기
        start "" "http://localhost:8081"
    )
)

echo.
echo ========================================
echo ✅ 서버가 재시작되었습니다!
echo.
echo 📌 Google 로그인 문제 해결:
echo    1. 브라우저에서 Ctrl+Shift+R로 강력 새로고침
echo    2. 시크릿/InPrivate 모드 사용 권장
echo    3. 개발자 도구(F12) > Network > Disable cache 체크
echo.
echo 🔍 헬스체크: http://localhost:8081/health
echo ========================================
echo.
echo 이 창은 10초 후 자동으로 닫힙니다...
timeout /t 10 /nobreak >nul
exit