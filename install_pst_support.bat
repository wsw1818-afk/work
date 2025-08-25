@echo off
chcp 65001 >nul
echo ========================================
echo PST File Support Library Installation
echo ========================================
echo.

echo Installing libpff-python library...
pip install libpff-python

if %errorlevel% neq 0 (
    echo.
    echo libpff-python installation failed.
    echo.
    echo Alternative: Install python-libpst
    pip install python-libpst
)

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Manual Installation Required
    echo ========================================
    echo.
    echo Unfortunately, Python PST libraries are not available via pip.
    echo.
    echo Please install one of the following:
    echo.
    echo 1. Download and install libpst tools:
    echo    - Windows: https://www.five-ten-sg.com/libpst/
    echo    - Add readpst.exe to your PATH
    echo.
    echo 2. Use Windows Subsystem for Linux (WSL):
    echo    - Install WSL
    echo    - Run: sudo apt-get install pst-utils
    echo.
    echo 3. Install Microsoft Outlook
    echo    - The program will use Outlook COM interface
    echo.
) else (
    echo.
    echo ========================================
    echo Installation Complete!
    echo ========================================
    echo.
    echo You can now import PST files in the program.
    echo Run clean_and_run.bat to start the program.
    echo.
)

pause