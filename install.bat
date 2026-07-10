@echo off
setlocal
title Montana PQH Team - Install
cd /d "%~dp0"

echo.
echo   ============================================
echo     Montana PQH Team - Install
echo   ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] Node.js was not found on PATH.
  echo   Opening the Node.js download page in your browser...
  echo   Install the LTS version, then run this script again.
  echo   ^(If you just installed Node.js, close this window and
  echo    open a new one first - PATH only updates in new windows.^)
  echo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo   Node.js %NODE_VERSION% detected.
echo.

echo   [1/2] Installing client dependencies  ^(app/^)
echo   --------------------------------------------
pushd "%~dp0app"
call npm install
if errorlevel 1 (
  popd
  echo.
  echo   [ERROR] Client dependency install failed. See the log above.
  echo   Check your internet connection and try again.
  echo.
  pause
  exit /b 1
)
popd
echo.
echo   Client dependencies installed.
echo.

echo   [2/2] Installing Cloud Functions dependencies  ^(functions/^)
echo   -------------------------------------------------------------
pushd "%~dp0functions"
call npm install
if errorlevel 1 (
  popd
  echo.
  echo   [WARNING] Functions dependency install failed. This only
  echo   affects backend deployment, not the local app - continuing.
  echo.
) else (
  popd
  echo.
  echo   Functions dependencies installed.
  echo.
)

if not exist "%~dp0app\.env.local" (
  copy /y "%~dp0app\.env.example" "%~dp0app\.env.local" >nul
  echo   Created app\.env.local from app\.env.example.
  echo   Fill in your Firebase web-app config there to enable live mode.
  echo   Demo mode works fully without it.
  echo.
)

if /i "%~1"=="/fromstart" exit /b 0

echo   ============================================
echo     Install complete.
echo     Run start.bat to launch the dev server.
echo   ============================================
echo.
pause
exit /b 0
