@echo off
title Clean and Run Mail Backup Manager
cls

echo ====================================
echo  Clean and Run Mail Backup Manager  
echo ====================================
echo.

echo Cleaning old database files...
if exist mail_backup.db (
    del mail_backup.db
    echo - Deleted old database file
)

if exist attachments (
    rmdir /s /q attachments
    echo - Deleted attachments folder
)

echo.
echo Searching for Python...
set PYTHON_EXE=

REM Try different Python locations
for %%P in (
    "py"
    "python"
    "C:\Python39\python.exe"
    "C:\Python310\python.exe"
    "C:\Python311\python.exe"
    "C:\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe"
) do (
    %%P --version >nul 2>&1
    if not errorlevel 1 (
        echo [FOUND] Python at: %%P
        %%P --version
        set PYTHON_EXE=%%P
        goto :found
    )
)

echo [ERROR] Python not found!
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
)

pause