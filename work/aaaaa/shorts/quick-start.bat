@echo off
:: 빠른 시작 - 최소한의 확인만 수행
title ⚡ Quick Start
color 0A

:: 폴더 생성 (조용히)
if not exist "media\다운로드" mkdir "media\다운로드" 2>nul
if not exist "media\카테고리" mkdir "media\카테고리" 2>nul

:: 브라우저 열기
start http://localhost:3000/folder-manager.html

:: 서버 시작
node server.js