@echo off
chcp 65001 >nul
title 📁 YouTube Shorts 미디어 매니저
color 0E

cls
echo.
echo     ╔══════════════════════════════════════════════════╗
echo     ║                                                  ║
echo     ║      📁 YouTube Shorts 미디어 매니저 v2.0       ║
echo     ║                                                  ║
echo     ║         폴더 기반 자동 분류 시스템               ║
echo     ║                                                  ║
echo     ╚══════════════════════════════════════════════════╝
echo.
echo     시작 시간: %date% %time%
echo     ─────────────────────────────────────────────────
echo.

:: Node.js 확인
echo [확인] Node.js 설치 여부 체크 중...
where node >nul 2>&1
if %errorLevel% NEQ 0 (
    color 0C
    echo.
    echo     ⚠️  Node.js가 설치되어 있지 않습니다!
    echo.
    echo     Node.js를 먼저 설치해주세요:
    echo     https://nodejs.org/
    echo.
    echo     브라우저를 열까요? (Y/N)
    choice /C YN /N
    if errorlevel 1 start https://nodejs.org/
    pause
    exit
)
echo     ✅ Node.js 설치 확인 완료
echo.

:: 폴더 생성
echo [설정] 폴더 구조 생성 중...
if not exist "media" (
    mkdir media
    echo     📁 media 폴더 생성
)
if not exist "media\다운로드" (
    mkdir "media\다운로드"
    echo     📁 media\다운로드 폴더 생성
)
if not exist "media\카테고리" (
    mkdir "media\카테고리"
    echo     📁 media\카테고리 폴더 생성
)

:: 기본 카테고리 생성
set categories=여행 요리 게임 교육 라이프 기술 운동 음악 예술 동물 패션 뷰티
for %%i in (%categories%) do (
    if not exist "media\카테고리\%%i" (
        mkdir "media\카테고리\%%i"
        echo     📂 카테고리\%%i 폴더 생성
    )
)
echo     ✅ 폴더 구조 준비 완료
echo.

:: 패키지 설치
echo [설치] 필요한 패키지 확인 중...
if not exist "node_modules" (
    echo     📦 패키지를 설치합니다...
    call npm install >nul 2>&1
    if %errorLevel% NEQ 0 (
        color 0C
        echo     ❌ 패키지 설치 실패!
        echo     수동으로 'npm install' 명령을 실행해주세요.
        pause
        exit
    )
    echo     ✅ 패키지 설치 완료
) else (
    echo     ✅ 패키지 이미 설치됨
)
echo.

:: 포트 체크
echo [확인] 포트 3000 사용 가능 여부 체크 중...
netstat -an | findstr :3000 >nul
if %errorLevel% EQU 0 (
    echo     ⚠️  포트 3000이 이미 사용 중입니다.
    echo     기존 서버를 종료하시겠습니까? (Y/N)
    choice /C YN /N
    if errorlevel 1 (
        taskkill /F /IM node.exe >nul 2>&1
        timeout /t 2 /nobreak >nul
        echo     ✅ 기존 서버 종료 완료
    )
) else (
    echo     ✅ 포트 3000 사용 가능
)
echo.

:: 서버 시작
cls
echo.
echo     ╔══════════════════════════════════════════════════╗
echo     ║                                                  ║
echo     ║         🚀 서버가 시작되었습니다!                ║
echo     ║                                                  ║
echo     ╚══════════════════════════════════════════════════╝
echo.
echo     📁 폴더 위치:
echo        %cd%\media\
echo.
echo     🌐 웹 인터페이스:
echo        http://localhost:3000/folder-manager.html
echo.
echo     📝 사용 방법:
echo        1. media\다운로드 폴더에 파일을 넣으세요
echo        2. 웹에서 카테고리별로 자동/수동 분류
echo        3. 드래그 앤 드롭으로 쉽게 이동
echo.
echo     ⚡ 단축키:
echo        - Ctrl+C: 서버 종료
echo        - F5: 웹 페이지 새로고침
echo.
echo     ─────────────────────────────────────────────────
echo.

:: 브라우저 열기
echo     🌐 3초 후 브라우저가 자동으로 열립니다...
timeout /t 3 /nobreak >nul
start http://localhost:3000/folder-manager.html

:: 서버 실행
echo.
echo     📡 서버 로그:
echo     ─────────────────────────────────────────────────
node server.js

:: 종료 시
echo.
echo     ─────────────────────────────────────────────────
echo     서버가 종료되었습니다.
echo.
pause