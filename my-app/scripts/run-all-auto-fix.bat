@echo off
REM COMPLETE AUTO-FIX SCRIPT FOR WINDOWS
REM This script runs all auto-fix tools in sequence

echo 🚀 Starting Complete Auto-Fix Process...
echo.

REM Step 1: Vercel Environment Variables
echo Step 1: Fixing Vercel Environment Variables...
if "%VERCEL_TOKEN%"=="" (
    echo ❌ VERCEL_TOKEN not set
    echo    Set it with: set VERCEL_TOKEN=your_token
) else (
    node scripts\auto-fix-vercel.js
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Vercel fix complete
    ) else (
        echo ❌ Vercel fix failed
    )
)
echo.

REM Step 2: Supabase Admin User
echo Step 2: Fixing Supabase Admin User...
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ SUPABASE_SERVICE_ROLE_KEY not set
    echo    Set it with: set SUPABASE_SERVICE_ROLE_KEY=your_key
) else (
    node scripts\auto-fix-supabase.js
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Supabase fix complete
    ) else (
        echo ❌ Supabase fix failed
    )
)
echo.

REM Step 3: Summary
echo ✅ Auto-Fix Process Complete!
echo.
echo Next steps:
echo 1. Wait for Vercel deployment to complete
echo 2. Test login at: https://mynew-frontendgym.vercel.app/login
echo 3. Use credentials: fitnesswithimran1@gmail.com / Aa543543@

pause


