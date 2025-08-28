@echo off
echo ===================================
echo YouTube Shorts 폴더 미디어 매니저
echo ===================================
echo.
echo 📦 필요한 패키지 설치 중...
call npm install
echo.
echo 🚀 서버 시작 중...
echo.
echo 📁 폴더 구조:
echo   - media/다운로드: 새 파일을 여기에 넣으세요
echo   - media/카테고리/[카테고리명]: 분류된 파일들
echo.
echo 🌐 브라우저에서 http://localhost:3000/folder-manager.html 을 열어주세요
echo.
node server.js
pause