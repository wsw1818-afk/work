@echo off
echo ========================================
echo PST 파일 지원 라이브러리 설치
echo ========================================
echo.

echo Python PST 라이브러리를 설치합니다...
pip install pst-extractor

if %errorlevel% neq 0 (
    echo.
    echo pst-extractor 설치 실패. pypff를 시도합니다...
    pip install pypff
)

echo.
echo ========================================
echo 설치 완료!
echo ========================================
echo.
echo 이제 프로그램에서 PST 파일을 가져올 수 있습니다.
echo clean_and_run.bat를 실행하여 프로그램을 시작하세요.
echo.
pause