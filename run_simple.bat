@echo off
title Mail Backup Manager
cls

echo ====================================
echo     Mail Backup Manager
echo ====================================
echo.

echo Checking Python...
python --version
if errorlevel 1 (
    echo Python is not found!
    pause
    exit
)

echo.
echo Installing/Updating packages...
pip install chardet extract-msg --quiet

echo.
echo Starting program...
echo.
echo (If the program closes immediately, there might be an error)
echo (Check the console output above for any error messages)
echo.

python mail_backup_manager.py

echo.
echo ====================================
echo Program finished or encountered an error
echo ====================================
echo.
echo If you see any error messages above, please:
echo 1. Make sure Python is properly installed
echo 2. Make sure you have internet connection for pip install
echo 3. Try running as Administrator
echo.
pause