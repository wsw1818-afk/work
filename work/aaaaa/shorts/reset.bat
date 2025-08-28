@echo off
title 🔄 미디어 매니저 초기화
color 0E

echo ===============================================
echo    미디어 매니저 초기화
echo ===============================================
echo.
echo 이 작업은 다음을 수행합니다:
echo   1. 모든 미디어 파일 백업
echo   2. 폴더 구조 재생성
echo   3. 설정 초기화
echo.
echo 계속하시겠습니까? (Y/N)
choice /C YN /N
if errorlevel 2 exit

echo.
echo [1] 백업 생성 중...

:: 백업 폴더 생성
set backup_folder=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_folder=%backup_folder: =0%
mkdir "%backup_folder%" 2>nul

:: media 폴더 백업
if exist "media" (
    xcopy "media" "%backup_folder%\media" /E /I /Q
    echo     ✅ media 폴더 백업 완료
)

echo.
echo [2] 기존 폴더 정리 중...
if exist "media\다운로드" (
    rmdir /S /Q "media\다운로드"
    echo     ✅ 다운로드 폴더 정리
)

echo.
echo [3] 새 폴더 구조 생성 중...
mkdir "media" 2>nul
mkdir "media\다운로드" 2>nul
mkdir "media\카테고리" 2>nul

:: 기본 카테고리 재생성
set categories=여행 요리 게임 교육 라이프 기술 운동 음악 예술 동물 패션 뷰티
for %%i in (%categories%) do (
    mkdir "media\카테고리\%%i" 2>nul
    echo     📁 카테고리\%%i 생성
)

echo.
echo [4] node_modules 정리...
echo     node_modules를 삭제하시겠습니까? (Y/N)
choice /C YN /N /T 5 /D N
if errorlevel 1 (
    if exist "node_modules" (
        rmdir /S /Q "node_modules"
        echo     ✅ node_modules 삭제 완료
        echo     ⚠️  다시 설치하려면 'install.bat'을 실행하세요
    )
)

echo.
echo ===============================================
echo    초기화 완료!
echo    백업 위치: %backup_folder%
echo ===============================================
pause