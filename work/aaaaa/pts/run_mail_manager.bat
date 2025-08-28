@echo off
title Mail Backup Manager
echo ======================================
echo   메일 백업 관리자 시작
echo ======================================
echo.

REM Python 설치 확인
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python을 먼저 설치해주세요: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 필요한 패키지 자동 설치
echo 필요한 패키지를 확인하고 설치합니다...
pip show chardet >nul 2>&1
if %errorlevel% neq 0 (
    echo chardet 설치 중...
    pip install chardet
)

pip show extract-msg >nul 2>&1
if %errorlevel% neq 0 (
    echo extract-msg 설치 중...
    pip install extract-msg
)

echo.
echo 메일 백업 관리자를 실행합니다...
echo ======================================
python mail_backup_manager.py

if %errorlevel% neq 0 (
    echo.
    echo [오류] 프로그램 실행 중 문제가 발생했습니다.
    pause
)