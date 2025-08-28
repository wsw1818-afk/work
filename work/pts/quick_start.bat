@echo off
chcp 949 >nul
title Mail Backup Manager - Quick Start
color 0A

echo ============================================
echo       Mail Backup Manager - Quick Start
echo ============================================
echo.
echo Select Option:
echo.
echo   [1] Run Program (Python Required)
echo   [2] Create EXE File
echo   [3] Auto Install (with Shortcuts)
echo   [4] Create Desktop Shortcut Only
echo   [5] Exit
echo.

set /p choice=Choice (1-5): 

if "%choice%"=="1" (
    echo.
    echo Starting program...
    call run_mail_manager.bat
) else if "%choice%"=="2" (
    echo.
    echo Creating EXE file...
    python build_exe.py
    pause
) else if "%choice%"=="3" (
    echo.
    echo Starting auto install...
    call install.bat
) else if "%choice%"=="4" (
    echo.
    echo Creating desktop shortcut...
    cscript //nologo create_shortcut.vbs
    pause
) else if "%choice%"=="5" (
    exit
) else (
    echo.
    echo Invalid choice. Please try again.
    pause
    cls
    call quick_start.bat
)