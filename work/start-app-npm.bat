@echo off
chcp 65001 >nul
echo ======================================
echo Starting App...
echo ======================================

cd /d "%~dp0"

REM Kill existing port 3000 processes
echo.
echo [1/3] Checking port 3000...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3000 is in use. Stopping processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo Processes stopped.
)

REM Start Next.js dev server
echo.
echo [2/3] Starting Next.js server...
start "Finance Tracker - Next.js" cmd /k "npm run dev"

REM Wait for server to be ready
echo Waiting for server (max 45 seconds)...
set /a counter=0
:wait_loop
timeout /t 1 /nobreak >nul

REM Check if port is listening
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    set /a counter+=1
    if %counter% lss 45 goto wait_loop
    goto timeout_error
)

REM Check HTTP response using PowerShell
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 goto server_ready

set /a counter+=1
if %counter% lss 45 goto wait_loop

:timeout_error
echo Error: Server did not start within 45 seconds.
pause
exit /b 1

:server_ready
echo Server is ready! (HTTP 200 OK)

REM Start Electron app
echo.
echo [3/3] Starting Electron app...
timeout /t 1 /nobreak >nul
start "Finance Tracker - Electron" cmd /k "npm run electron:dev"

echo.
echo ======================================
echo App started successfully!
echo ======================================
echo.
echo To stop: Press Ctrl+C in each window
echo.
