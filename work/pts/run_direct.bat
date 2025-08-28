@echo off
echo Starting Mail Backup Manager...
echo.

python mail_backup_manager.py

if errorlevel 1 (
    echo.
    echo ====================================
    echo ERROR: Cannot run the program
    echo ====================================
    echo.
    echo Possible issues:
    echo 1. Python is not installed
    echo 2. Required packages are missing
    echo.
    echo Trying to install required packages...
    echo.
    
    pip install chardet extract-msg
    
    echo.
    echo Trying to run again...
    python mail_backup_manager.py
    
    if errorlevel 1 (
        echo.
        echo Still cannot run. Please install Python from:
        echo https://www.python.org/downloads/
        echo.
        echo After installing Python, run this file again.
    )
)

pause