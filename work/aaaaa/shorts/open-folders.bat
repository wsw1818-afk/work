@echo off
title 📂 폴더 열기
echo ===============================================
echo    미디어 폴더 빠른 열기
echo ===============================================
echo.
echo 어떤 폴더를 열까요?
echo.
echo   [1] 다운로드 폴더
echo   [2] 카테고리 폴더
echo   [3] 전체 미디어 폴더
echo   [4] 프로젝트 폴더
echo   [0] 취소
echo.
choice /C 12340 /N /M "선택: "

if errorlevel 5 exit
if errorlevel 4 (
    explorer "%cd%"
    exit
)
if errorlevel 3 (
    if not exist "media" mkdir media
    explorer "%cd%\media"
    exit
)
if errorlevel 2 (
    if not exist "media\카테고리" mkdir "media\카테고리"
    explorer "%cd%\media\카테고리"
    exit
)
if errorlevel 1 (
    if not exist "media\다운로드" mkdir "media\다운로드"
    explorer "%cd%\media\다운로드"
    exit
)