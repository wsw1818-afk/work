@echo off
chcp 65001 >nul
title ⚡ 빠른 수정 및 시작
color 0A

echo.
echo ⚡ 빠른 수정 모드
echo ─────────────────────────────────────────
echo.

:: 기존 프로세스 강제 종료
echo [1/4] 기존 Node.js 프로세스 종료 중...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo ✅ 완료

:: 폴더 생성
echo [2/4] 폴더 구조 확인 중...
if not exist "media\다운로드" mkdir "media\다운로드"
if not exist "media\카테고리" mkdir "media\카테고리"
echo ✅ 완료

:: 패키지 설치 건너뛰기 (이미 설치되어 있다고 가정)
echo [3/4] 패키지 확인 생략...
echo ✅ 완료

:: 브라우저 열기
echo [4/4] 브라우저 열기...
start http://localhost:3000/folder-manager.html
echo ✅ 완료

echo.
echo 🚀 서버 시작:
echo ─────────────────────────────────────────
node server.js