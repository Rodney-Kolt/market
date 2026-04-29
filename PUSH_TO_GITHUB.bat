@echo off
title Market Assistant - Push to GitHub
color 0B
echo.
echo ============================================
echo   Market Assistant - GitHub Push Script
echo ============================================
echo.

REM Copy to safe location first
echo [1/3] Copying project out of OneDrive...
if not exist "C:\Projects\market-assistant" mkdir "C:\Projects\market-assistant"
robocopy "%~dp0" "C:\Projects\market-assistant" /E /XD node_modules .next /XF *.bat /NFL /NDL /NJH /NJS
cd /d "C:\Projects\market-assistant"
echo Done.

REM Init git
echo.
echo [2/3] Setting up Git...
git init
git add .
git commit -m "Market Assistant MVP - initial commit"
git branch -M main
echo Done.

REM Push
echo.
echo [3/3] Ready to push to GitHub!
echo.
echo ============================================
echo  Go to github.com and create a NEW repository
echo  named: market-assistant
echo  (leave it empty - no README, no .gitignore)
echo.
echo  Then paste the remote URL below:
echo ============================================
echo.
set /p REPO_URL="Paste your GitHub repo URL (e.g. https://github.com/yourname/market-assistant.git): "
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ============================================
echo   Code is on GitHub!
echo   Now go to vercel.com and import the repo.
echo ============================================
pause
