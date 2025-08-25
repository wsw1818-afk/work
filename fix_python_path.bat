@echo off
title Python PATH Fix Helper
cls

echo ====================================
echo     Python PATH Fix Helper
echo ====================================
echo.

echo This script will help you fix Python PATH issues.
echo.

REM Find Python installations
echo Searching for Python installations...
echo.

set found_python=

REM Check common locations and create a list
for %%P in (
    "C:\Python39\python.exe"
    "C:\Python310\python.exe" 
    "C:\Python311\python.exe"
    "C:\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%PROGRAMFILES%\Python39\python.exe"
    "%PROGRAMFILES%\Python310\python.exe"
    "%PROGRAMFILES%\Python311\python.exe"
    "%PROGRAMFILES%\Python312\python.exe"
) do (
    if exist %%P (
        echo [FOUND] %%P
        %%P --version 2>nul
        if not defined found_python set found_python=%%P
        echo.
    )
)

if not defined found_python (
    echo No Python installations found in common locations.
    echo.
    echo Solutions:
    echo 1. Install Python from https://www.python.org/downloads/
    echo 2. During installation, CHECK "Add Python to PATH"
    echo 3. Restart your computer after installation
    echo.
    pause
    exit /b 1
)

echo Python found! Let's try to run the program with full path...
echo Using: %found_python%
echo.

echo Installing packages...
%found_python% -m pip install chardet extract-msg

echo.
echo Running Mail Backup Manager...
%found_python% mail_backup_manager.py

echo.
echo ====================================
echo To permanently fix PATH issue:
echo ====================================
echo.
echo 1. Press Win+R, type "sysdm.cpl", press Enter
echo 2. Click "Environment Variables" button
echo 3. In "System Variables", find "Path" and click "Edit"
echo 4. Click "New" and add the Python folder path
echo 5. Example: C:\Python311 or %LOCALAPPDATA%\Programs\Python\Python311
echo 6. Click OK on all dialogs
echo 7. Restart Command Prompt
echo.
pause