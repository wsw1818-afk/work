@echo off
echo ========================================
echo   📅 달력 앱 서버 시작
echo ========================================
echo.

:: npm 패키지 설치 확인
if not exist node_modules (
    echo 📦 필요한 패키지를 설치합니다...
    npm install
    echo.
)

:: 서버 시작
echo 🚀 서버를 시작합니다...
echo.
node server.js

pause