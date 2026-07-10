@echo off
setlocal
title Montana PQH Team - Dev Server
cd /d "%~dp0"

echo.
echo   ============================================
echo     Montana PQH Team - Dev Server
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

if not exist "%~dp0app\node_modules" (
  echo   First run detected - installing dependencies first...
  echo.
  call "%~dp0install.bat" /fromstart
  if errorlevel 1 (
    echo.
    echo   [ERROR] Setup failed, see above. Cannot start the dev server.
    echo.
    pause
    exit /b 1
  )
  echo   Setup complete. Starting the dev server...
  echo.
)

for /f "delims=" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo   Node.js %NODE_VERSION%  -  starting Vite...
echo   Your browser will open automatically once it's ready.
echo   Ctrl+C stops the server.
echo.

pushd "%~dp0app"
call npm run dev
set "DEV_EXIT=%errorlevel%"
popd

echo.
if not "%DEV_EXIT%"=="0" (
  echo   Dev server exited with an error  ^(code %DEV_EXIT%^)
) else (
  echo   Dev server stopped.
)
echo.
pause
exit /b %DEV_EXIT%
