@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ================================================================
echo   Deploy Pamporovo Villa -^> JetHost (production)
echo ================================================================
echo.
echo   1. Build locally (pnpm build)
echo   2. Upload dist/ + .env to server
echo   3. DB sync + restart Node app (cloudlinux-selector)
echo.
echo   Needs: .env, .deploy.env, pnpm, ssh, tar
echo   Optional args: -SkipBuild   -SkipSecrets
echo.

if not exist ".env" (
  echo ERROR: .env not found. Copy .env.example to .env and fill it in.
  echo.
  pause
  exit /b 1
)

if not exist ".deploy.env" (
  echo ERROR: .deploy.env not found. Copy .deploy.env.example to .deploy.env
  echo          and add JetHost SSH credentials.
  echo.
  pause
  exit /b 1
)

where pnpm >nul 2>&1
if errorlevel 1 (
  echo ERROR: pnpm not found. Install Node.js and: npm install -g pnpm
  echo.
  pause
  exit /b 1
)

where ssh >nul 2>&1
if errorlevel 1 (
  echo ERROR: ssh not found. Install Git for Windows or OpenSSH Client.
  echo.
  pause
  exit /b 1
)

where tar >nul 2>&1
if errorlevel 1 (
  echo ERROR: tar not found. Install Git for Windows (includes tar^) or add tar to PATH.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-remote.ps1" %*
set "EXITCODE=%ERRORLEVEL%"

echo.
if not "%EXITCODE%"=="0" (
  echo Deploy FAILED ^(exit code %EXITCODE%^).
  echo If the site shows 503: cPanel -^> Setup Node.js App -^> pamporovo-villa -^> Restart
  echo.
  pause
  exit /b %EXITCODE%
)

echo Deploy finished OK.
echo.
pause
exit /b 0
