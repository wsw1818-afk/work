@echo off
title Mail Backup Manager
cls

echo ============================================
echo     Mail Backup Manager - Start Menu
echo ============================================
echo.
echo 1. Run Program
echo 2. Create EXE File  
echo 3. Install Program
echo 4. Create Shortcut
echo 5. Exit
echo.

choice /c 12345 /n /m "Select Number (1-5): "

if errorlevel 5 goto end
if errorlevel 4 goto shortcut
if errorlevel 3 goto install
if errorlevel 2 goto exe
if errorlevel 1 goto run

:run
cls
echo.
echo Starting program...
echo Checking required packages...

REM Check if required packages are installed
python -c "import chardet, email, sqlite3, tkinter" 2>nul
if errorlevel 1 (
    echo.
    echo Installing required packages...
    pip install chardet extract-msg
    echo.
)

echo.
echo Running Mail Backup Manager...
echo.
python mail_backup_manager.py
if errorlevel 1 (
    echo.
    echo ==========================================
    echo ERROR: Failed to run the program
    echo ==========================================
    echo.
    echo Possible causes:
    echo 1. Missing packages (chardet, extract-msg)
    echo 2. Python path issues
    echo 3. File not found
    echo.
    echo Trying to install packages again...
    pip install chardet extract-msg
    echo.
    echo Please try running again or contact support.
)
echo.
pause
goto menu

:exe
cls
echo.
echo Creating EXE file...
echo.
python build_exe.py
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed
    echo Please install Python first
)
pause
goto menu

:install
cls
echo.
echo Starting installation...
echo.
start /wait install.bat
goto end

:shortcut
cls
echo.
echo Creating shortcut...
echo.
cscript //nologo create_shortcut.vbs
if errorlevel 1 (
    echo ERROR: Failed to create shortcut
)
pause
goto menu

:menu
cls
start start.bat
goto end

:end
exit