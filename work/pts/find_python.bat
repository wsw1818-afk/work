@echo off
title Python Path Finder
cls

echo ====================================
echo     Python Path Finder
echo ====================================
echo.

echo Searching for Python installations...
echo.

REM Check common Python locations
set python_found=0

echo Checking PATH...
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found in PATH:
    where python
    python --version
    set python_found=1
) else (
    echo [X] Python not found in PATH
)

echo.
echo Checking common installation paths...

REM Check C:\Python* folders
if exist "C:\Python*" (
    echo [FOUND] Python folders in C:\:
    for /d %%d in (C:\Python*) do (
        if exist "%%d\python.exe" (
            echo   %%d\python.exe
            "%%d\python.exe" --version 2>nul
            set python_found=1
        )
    )
)

REM Check Program Files
if exist "%PROGRAMFILES%\Python*" (
    echo [FOUND] Python in Program Files:
    for /d %%d in ("%PROGRAMFILES%\Python*") do (
        if exist "%%d\python.exe" (
            echo   %%d\python.exe
            "%%d\python.exe" --version 2>nul
            set python_found=1
        )
    )
)

REM Check AppData Local
if exist "%LOCALAPPDATA%\Programs\Python\*" (
    echo [FOUND] Python in AppData:
    for /d %%d in ("%LOCALAPPDATA%\Programs\Python\*") do (
        if exist "%%d\python.exe" (
            echo   %%d\python.exe
            "%%d\python.exe" --version 2>nul
            set python_found=1
        )
    )
)

REM Check Microsoft Store Python
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" (
    echo [FOUND] Microsoft Store Python:
    echo   %LOCALAPPDATA%\Microsoft\WindowsApps\python.exe
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" --version 2>nul
    set python_found=1
)

echo.
echo ====================================

if %python_found%==1 (
    echo Python installations found!
    echo.
    echo To fix PATH issue:
    echo 1. Add Python to Windows PATH environment variable
    echo 2. Or reinstall Python with "Add Python to PATH" checked
    echo 3. Or use full path to python.exe
) else (
    echo No Python installations found.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation!
)

echo.
pause