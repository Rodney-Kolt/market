@echo off
title Market Assistant - Deploy to Vercel
color 0A
echo.
echo ============================================
echo   Market Assistant - Auto Deploy Script
echo ============================================
echo.

REM Step 1: Copy project to C:\Projects (out of OneDrive)
echo [1/5] Copying project out of OneDrive...
if not exist "C:\Projects\market-assistant" mkdir "C:\Projects\market-assistant"

REM Copy everything except node_modules and .next
robocopy "%~dp0" "C:\Projects\market-assistant" /E /XD node_modules .next .git /XF *.bat /NFL /NDL /NJH /NJS
echo Done.

REM Step 2: Install dependencies
echo.
echo [2/5] Installing dependencies (this takes 2-3 minutes)...
cd /d "C:\Projects\market-assistant"
call npm install
echo Done.

REM Step 3: Install Vercel CLI
echo.
echo [3/5] Installing Vercel CLI...
call npm install -g vercel
echo Done.

REM Step 4: Build check
echo.
echo [4/5] Checking build...
call npm run build
if %errorlevel% neq 0 (
    echo BUILD FAILED - check errors above
    pause
    exit /b 1
)
echo Build successful!

REM Step 5: Deploy
echo.
echo [5/5] Deploying to Vercel...
echo.
echo ============================================
echo  IMPORTANT: When Vercel asks questions:
echo  - Set up and deploy? YES
echo  - Which scope? (your account)
echo  - Link to existing project? NO
echo  - Project name? market-assistant
echo  - Directory? ./  (just press Enter)
echo  - Override settings? NO
echo ============================================
echo.
echo After deploy, add these env vars in Vercel dashboard:
echo   NEXT_PUBLIC_SUPABASE_URL = https://xnbskezssonfveazbjzu.supabase.co
echo   NEXT_PUBLIC_SUPABASE_ANON_KEY = (your anon key)
echo   NEXT_PUBLIC_APP_URL = https://market-assistant.vercel.app
echo.
pause
call vercel --prod

echo.
echo ============================================
echo   Deployment complete!
echo ============================================
pause
