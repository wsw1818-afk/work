@echo off
chcp 65001 >nul
echo ========================================
echo PST File Support Library Installation
echo ========================================
echo.

echo Installing Python PST library...
pip install pst-extractor

if %errorlevel% neq 0 (
    echo.
    echo pst-extractor installation failed. Trying pypff...
    pip install pypff
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now import PST files in the program.
echo Run clean_and_run.bat to start the program.
echo.
pause