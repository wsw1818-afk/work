@echo off
cd /d "%~dp0"
start "Next.js" cmd /k pnpm dev
timeout /t 5 /nobreak
start "Electron" cmd /k pnpm electron:dev
