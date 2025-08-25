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
echo.
python mail_backup_manager.py
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed or program not found
    echo Please install Python first or select option 3 for auto-install
)
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