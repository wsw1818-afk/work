@echo off
echo ========================================
echo Installing readpst for Windows
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0download_readpst.ps1"

if exist "%~dp0tools\readpst.exe" (
    echo.
    echo readpst.exe successfully installed!
    echo You can now import PST files.
) else (
    echo.
    echo Installation failed. Please install manually.
)

pause