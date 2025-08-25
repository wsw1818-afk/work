@echo off
echo Testing Python Installation...
echo ================================
echo.

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python is found in PATH
    echo.
    echo Python version:
    python --version
    echo.
    echo Python location:
    where python
    echo.
    echo Testing Python:
    python -c "print('Python is working correctly!')"
) else (
    echo [ERROR] Python is NOT found
    echo.
    echo Checking common Python locations...
    echo.
    
    if exist "C:\Python*" (
        echo Found Python folder in C:\
        dir C:\Python* /b
    )
    
    if exist "%LOCALAPPDATA%\Programs\Python\*" (
        echo Found Python in LocalAppData
        dir "%LOCALAPPDATA%\Programs\Python" /b
    )
    
    echo.
    echo Please install Python from:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Check "Add Python to PATH" during installation!
)

echo.
echo ================================
pause