@echo off
setlocal enabledelayedexpansion
title 메일 백업 관리자 설치

echo ================================================
echo          메일 백업 관리자 자동 설치
echo ================================================
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 관리자 권한이 필요합니다.
    echo 이 파일을 마우스 오른쪽 클릭 후 "관리자 권한으로 실행"을 선택하세요.
    pause
    exit /b 1
)

REM Python 설치 확인
echo [1/5] Python 설치 확인 중...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Python이 설치되어 있지 않습니다.
    echo Python을 자동으로 다운로드하고 설치하시겠습니까? (Y/N)
    set /p install_python=선택: 
    
    if /i "!install_python!"=="Y" (
        echo Python 설치 프로그램을 다운로드합니다...
        powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.0/python-3.11.0-amd64.exe' -OutFile 'python_installer.exe'"
        echo Python을 설치합니다... (설치 창이 열리면 지시에 따라 설치하세요)
        start /wait python_installer.exe
        del python_installer.exe
    ) else (
        echo Python 설치가 취소되었습니다.
        echo https://www.python.org/downloads/ 에서 직접 설치해주세요.
        pause
        exit /b 1
    )
) else (
    echo ✓ Python이 설치되어 있습니다.
)

REM 필요한 패키지 설치
echo.
echo [2/5] 필요한 패키지 설치 중...

pip install --upgrade pip >nul 2>&1

set packages=chardet extract-msg pyinstaller

for %%p in (%packages%) do (
    echo   - %%p 설치 중...
    pip install %%p >nul 2>&1
    if !errorlevel! equ 0 (
        echo     ✓ %%p 설치 완료
    ) else (
        echo     × %%p 설치 실패
    )
)

REM 프로그램 폴더 생성
echo.
echo [3/5] 프로그램 폴더 생성 중...
set install_dir=%USERPROFILE%\MailBackupManager

if not exist "%install_dir%" (
    mkdir "%install_dir%"
    echo ✓ 폴더 생성: %install_dir%
) else (
    echo ✓ 폴더가 이미 존재합니다: %install_dir%
)

REM 파일 복사
echo.
echo [4/5] 프로그램 파일 복사 중...
copy /Y mail_backup_manager.py "%install_dir%\" >nul 2>&1
copy /Y run_mail_manager.bat "%install_dir%\" >nul 2>&1

if exist "%install_dir%\mail_backup_manager.py" (
    echo ✓ 프로그램 파일 복사 완료
) else (
    echo × 파일 복사 실패
    pause
    exit /b 1
)

REM 바탕화면 바로가기 생성
echo.
echo [5/5] 바탕화면 바로가기 생성 중...

set desktop=%USERPROFILE%\Desktop
set shortcut_name=메일 백업 관리자.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%desktop%\%shortcut_name%'); $Shortcut.TargetPath = '%install_dir%\run_mail_manager.bat'; $Shortcut.WorkingDirectory = '%install_dir%'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = '메일 백업 관리자'; $Shortcut.Save()"

if exist "%desktop%\%shortcut_name%" (
    echo ✓ 바탕화면 바로가기 생성 완료
) else (
    echo × 바로가기 생성 실패 (수동으로 생성해주세요)
)

REM 시작 메뉴 등록
echo.
echo 시작 메뉴에 등록 중...
set start_menu=%APPDATA%\Microsoft\Windows\Start Menu\Programs

if not exist "%start_menu%\Mail Backup Manager" (
    mkdir "%start_menu%\Mail Backup Manager"
)

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%start_menu%\Mail Backup Manager\메일 백업 관리자.lnk'); $Shortcut.TargetPath = '%install_dir%\run_mail_manager.bat'; $Shortcut.WorkingDirectory = '%install_dir%'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = '메일 백업 관리자'; $Shortcut.Save()"

echo.
echo ================================================
echo              설치가 완료되었습니다!
echo ================================================
echo.
echo 설치 위치: %install_dir%
echo.
echo 실행 방법:
echo   1. 바탕화면의 "메일 백업 관리자" 아이콘 더블클릭
echo   2. 시작 메뉴에서 "메일 백업 관리자" 검색
echo   3. %install_dir%\run_mail_manager.bat 실행
echo.
echo 지금 프로그램을 실행하시겠습니까? (Y/N)
set /p run_now=선택: 

if /i "!run_now!"=="Y" (
    echo.
    echo 프로그램을 실행합니다...
    cd /d "%install_dir%"
    start run_mail_manager.bat
)

echo.
pause