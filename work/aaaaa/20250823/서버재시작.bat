@echo off
chcp 65001 >nul

echo 기존 서버 종료 중...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do (
    taskkill /PID %%a /F 2>nul
)

timeout /t 2 /nobreak >nul

cd /d "%~dp0"

echo 서버 재시작 중...
start /min cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo 브라우저에서 열기...
start "" "http://localhost:8081"

echo.
echo ✅ 서버가 재시작되었습니다!
echo 브라우저가 자동으로 열립니다.
echo.
echo 이 창은 5초 후 자동으로 닫힙니다...
timeout /t 5 /nobreak >nul
exit