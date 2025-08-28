@echo off
chcp 65001 > nul
title 환율 계산기 설치

echo.
echo ===================================
echo    💰 환율 계산기 설치 시작
echo ===================================
echo.

echo 📦 필요한 패키지를 설치합니다...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ 패키지 설치 실패!
    echo Node.js가 설치되어 있는지 확인하세요.
    echo https://nodejs.org 에서 다운로드 가능합니다.
    pause
    exit /b 1
)

echo.
echo ✅ 설치 완료!
echo.
echo 🚀 환율계산기_실행.bat 파일을 실행하여 앱을 시작하세요.
echo.
pause