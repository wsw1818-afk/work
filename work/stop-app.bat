@echo off
echo ======================================
echo 가계부 앱 종료 중...
echo ======================================

REM 포트 3000 사용 중인 프로세스 종료
echo 포트 3000 프로세스 종료 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 프로세스 종료: %%a
    taskkill /F /PID %%a 2>nul
)

REM Electron 프로세스 종료
echo Electron 프로세스 종료 중...
taskkill /F /IM electron.exe 2>nul

echo.
echo ✓ 모든 프로세스가 종료되었습니다.
pause
