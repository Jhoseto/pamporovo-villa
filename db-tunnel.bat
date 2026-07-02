@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

REM ─────────────────────────────────────────────────────────────────────────
REM  SSH Tunnel to JetHost MySQL (use production DB for local development)
REM  Reads SSH credentials from .deploy.env automatically.
REM
REM  STEPS:
REM    1. Make sure .deploy.env is filled in (copy from .deploy.env.example)
REM    2. Run db-tunnel.bat in a separate window
REM    3. Run restart.bat -- the app will connect to the production database
REM ─────────────────────────────────────────────────────────────────────────

set "DEPLOY_ENV=%~dp0.deploy.env"
set "LOCAL_PORT=3307"
set "REMOTE_PORT=3306"

REM ── Четем .deploy.env ──────────────────────────────────────────────────
if not exist "%DEPLOY_ENV%" (
  echo.
  echo  ERROR: .deploy.env not found!
  echo  Copy .deploy.env.example to .deploy.env and fill in your SSH credentials.
  echo.
  echo  Example:
  echo    JETHOST_SSH_HOST=your-host.com
  echo    JETHOST_SSH_USER=cpanel_user
  echo    JETHOST_SSH_PORT=1022
  echo    JETHOST_SSH_KEY=C:\Users\%USERNAME%\.ssh\id_ed25519
  echo.
  pause
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%DEPLOY_ENV%") do (
  set "line=%%A"
  if not "!line:~0,1!"=="#" (
    if "%%A"=="JETHOST_SSH_HOST" set "SSH_HOST=%%B"
    if "%%A"=="JETHOST_SSH_USER" set "SSH_USER=%%B"
    if "%%A"=="JETHOST_SSH_PORT" set "SSH_PORT=%%B"
    if "%%A"=="JETHOST_SSH_KEY"  set "SSH_KEY=%%B"
  )
)

REM ── Validate parsed values ─────────────────────────────────────────────
if "%SSH_HOST%"=="" (
  echo.
  echo  ERROR: JETHOST_SSH_HOST is not set in .deploy.env
  echo.
  pause
  exit /b 1
)

if "%SSH_PORT%"=="" set "SSH_PORT=1022"

if "%SSH_KEY%"=="" (
  set "SSH_KEY=%USERPROFILE%\.ssh\id_ed25519"
)

if not exist "%SSH_KEY%" (
  echo.
  echo  ERROR: SSH key not found at: %SSH_KEY%
  echo  Check JETHOST_SSH_KEY in .deploy.env
  echo.
  pause
  exit /b 1
)

REM ── Check if port 3307 is already in use ───────────────────────────────
netstat -an | findstr ":%LOCAL_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo.
  echo  Port %LOCAL_PORT% is already in use -- tunnel may already be running.
  echo  If you want to restart it, close the other window first.
  echo.
  pause
  exit /b 0
)

echo.
echo ================================================================
echo   DB Tunnel: JetHost MySQL --^> localhost:%LOCAL_PORT%
echo ================================================================
echo.
echo   Server  : %SSH_HOST%:%SSH_PORT%
echo   User    : %SSH_USER%
echo   Tunnel  : localhost:%LOCAL_PORT% --^> MySQL localhost:%REMOTE_PORT%
echo.
echo   *** KEEP THIS WINDOW OPEN WHILE DEVELOPING ***
echo   *** Press Ctrl+C to stop the tunnel ***
echo.

ssh -N ^
  -L %LOCAL_PORT%:127.0.0.1:%REMOTE_PORT% ^
  -p %SSH_PORT% ^
  -i "%SSH_KEY%" ^
  -o StrictHostKeyChecking=no ^
  -o ServerAliveInterval=30 ^
  -o ServerAliveCountMax=6 ^
  -o ExitOnForwardFailure=yes ^
  %SSH_USER%@%SSH_HOST%

echo.
echo   Tunnel closed.
pause
endlocal
