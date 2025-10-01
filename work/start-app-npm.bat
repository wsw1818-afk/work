@echo off
cd /d "%~dp0"
start "Next.js" cmd /k npm run dev
timeout /t 5 /nobreak
start "Electron" cmd /k npm run electron:dev
