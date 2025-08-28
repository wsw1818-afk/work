@echo off
title YouTube Shorts Media Manager
color 0A

echo ===============================================
echo    YouTube Shorts 폴더 미디어 매니저 v2.0
echo ===============================================
echo.

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] 관리자 권한으로 실행해주세요.
    echo.
    pause
    exit
)

:: Node.js 설치 확인
where node >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] Node.js가 설치되어 있지 않습니다.
    echo.
    echo Node.js를 다운로드하시겠습니까? (Y/N)
    choice /C YN /N
    if errorlevel 2 goto :END
    if errorlevel 1 (
        echo.
        echo 브라우저에서 Node.js 다운로드 페이지를 엽니다...
        start https://nodejs.org/
        echo Node.js 설치 후 다시 실행해주세요.
        pause
        exit
    )
)

echo [1] 환경 설정 중...
echo ====================================

:: 폴더 구조 생성
if not exist "media" mkdir media
if not exist "media\다운로드" mkdir "media\다운로드"
if not exist "media\카테고리" mkdir "media\카테고리"

:: 기본 카테고리 폴더 생성
if not exist "media\카테고리\여행" mkdir "media\카테고리\여행"
if not exist "media\카테고리\요리" mkdir "media\카테고리\요리"
if not exist "media\카테고리\게임" mkdir "media\카테고리\게임"
if not exist "media\카테고리\교육" mkdir "media\카테고리\교육"
if not exist "media\카테고리\라이프" mkdir "media\카테고리\라이프"
if not exist "media\카테고리\기술" mkdir "media\카테고리\기술"

echo [✓] 폴더 구조 생성 완료
echo.

:: package.json 확인 및 생성
if not exist "package.json" (
    echo [2] package.json 생성 중...
    echo ====================================
    echo {> package.json
    echo   "name": "youtube-shorts-media-manager",>> package.json
    echo   "version": "2.0.0",>> package.json
    echo   "description": "YouTube Shorts Media Manager",>> package.json
    echo   "main": "server.js",>> package.json
    echo   "scripts": {>> package.json
    echo     "start": "node server.js",>> package.json
    echo     "dev": "nodemon server.js">> package.json
    echo   },>> package.json
    echo   "dependencies": {>> package.json
    echo     "express": "^4.18.2",>> package.json
    echo     "cors": "^2.8.5",>> package.json
    echo     "multer": "^1.4.5-lts.1",>> package.json
    echo     "chokidar": "^3.5.3",>> package.json
    echo     "socket.io": "^4.6.1">> package.json
    echo   },>> package.json
    echo   "devDependencies": {>> package.json
    echo     "nodemon": "^3.0.1">> package.json
    echo   }>> package.json
    echo }>> package.json
    echo [✓] package.json 생성 완료
    echo.
)

echo [3] 필요한 패키지 설치 중...
echo ====================================
call npm install
if %errorLevel% NEQ 0 (
    echo [!] 패키지 설치 실패
    pause
    exit
)
echo [✓] 패키지 설치 완료
echo.

:: 샘플 파일 생성 (선택사항)
echo [4] 샘플 파일을 생성하시겠습니까? (Y/N)
choice /C YN /N /T 5 /D N
if errorlevel 1 (
    echo.
    echo 샘플 이미지 파일 생성 중...
    echo This is a sample file > "media\다운로드\sample_travel_photo.jpg.txt"
    echo This is a sample file > "media\다운로드\sample_food_recipe.jpg.txt"
    echo This is a sample file > "media\다운로드\sample_game_clip.mp4.txt"
    echo [✓] 샘플 파일 생성 완료
)
echo.

:: 서버 시작
echo ===============================================
echo [5] 서버를 시작합니다...
echo ===============================================
echo.
echo 📁 폴더 구조:
echo    - media\다운로드: 새 파일을 여기에 넣으세요
echo    - media\카테고리\[카테고리명]: 분류된 파일들
echo.
echo 🌐 웹 인터페이스 주소:
echo    http://localhost:3000/folder-manager.html
echo.
echo ⚠️  종료하려면 Ctrl+C를 누르세요
echo ===============================================
echo.

:: 브라우저 자동 열기 (3초 후)
timeout /t 3 /nobreak >nul
start http://localhost:3000/folder-manager.html

:: 서버 실행
node server.js

:END
pause