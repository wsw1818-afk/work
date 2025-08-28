@echo off
echo ========================================
echo Checking readpst installation
echo ========================================
echo.

if exist "tools\readpst.exe" (
    echo [OK] readpst.exe found in tools folder
    echo Testing readpst...
    tools\readpst.exe --help >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] readpst.exe is working correctly
    ) else (
        echo [ERROR] readpst.exe found but not working
    )
) else (
    echo [MISSING] readpst.exe not found in tools folder
    echo.
    echo Please install readpst:
    echo 1. Download from: https://www.five-ten-sg.com/libpst/packages.html
    echo 2. Extract readpst.exe to tools\ folder
    echo 3. Or read PST_MANUAL_INSTALL.md for detailed instructions
)

echo.
echo Checking system PATH for readpst...
readpst --help >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] readpst found in system PATH
) else (
    echo [INFO] readpst not found in system PATH
)

echo.
pause