@echo off
title Mail Backup Manager - Path Finder
cls

echo ====================================
echo     Mail Backup Manager
echo ====================================
echo.

echo Searching for Python...
set PYTHON_EXE=

REM Try different Python locations
for %%P in (
    "python"
    "py"
    "C:\Python39\python.exe"
    "C:\Python310\python.exe"
    "C:\Python311\python.exe"
    "C:\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe"
    "%PROGRAMFILES%\Python39\python.exe"
    "%PROGRAMFILES%\Python310\python.exe"
    "%PROGRAMFILES%\Python311\python.exe"
    "%PROGRAMFILES%\Python312\python.exe"
) do (
    %%P --version >nul 2>&1
    if not errorlevel 1 (
        echo [FOUND] Python at: %%P
        %%P --version
        set PYTHON_EXE=%%P
        goto :found
    )
)

echo [ERROR] Python not found in common locations!
echo.
echo Please:
echo 1. Install Python from https://www.python.org/downloads/
echo 2. Make sure to check "Add Python to PATH" during installation
echo 3. Or run find_python.bat to see all Python installations
echo.
pause
exit /b 1

:found
echo.
echo Installing required packages...
%PYTHON_EXE% -m pip install chardet extract-msg --quiet

echo.
echo Starting Mail Backup Manager...
echo.

%PYTHON_EXE% mail_backup_manager.py

if errorlevel 1 (
    echo.
    echo ====================================
    echo ERROR: Program failed to start
    echo ====================================
    echo.
    echo Possible solutions:
    echo 1. Make sure all required packages are installed
    echo 2. Check if mail_backup_manager.py file exists
    echo 3. Try running as Administrator
    echo.
)

pause