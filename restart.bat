@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "PORT=3000"
set "APP_TITLE=Pamporovo Villa"
set "DB_TUNNEL_PORT=3307"

echo.
echo ========================================
echo  Restart: %APP_TITLE%
echo ========================================
echo.

REM ── [0/3] Start SSH tunnel if not already running ─────────────────────
netstat -an 2>nul | findstr ":%DB_TUNNEL_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo [0/3] Starting DB tunnel ^(JetHost MySQL -^> localhost:%DB_TUNNEL_PORT%^)...
  start "DB Tunnel" /D "%~dp0" cmd /k db-tunnel.bat
  echo   - Waiting 8 seconds for tunnel to connect...
  timeout /t 8 /nobreak >nul
  netstat -an 2>nul | findstr ":%DB_TUNNEL_PORT% " | findstr "LISTENING" >nul 2>&1
  if %ERRORLEVEL%==0 (
    echo   - Tunnel ready on port %DB_TUNNEL_PORT%.
  ) else (
    echo   - WARNING: Tunnel may still be connecting. Continuing...
  )
) else (
  echo [0/3] DB tunnel already active on port %DB_TUNNEL_PORT%. OK.
)
echo.

echo [1/3] Stopping processes on port %PORT%...
for /f "tokens=5" %%P in ('netstat -aon ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  echo   - Killing PID %%P
  taskkill /F /PID %%P >nul 2>&1
)

echo   - Stopping related node/tsx processes...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { ($_.Name -in @('node.exe','tsx.exe')) -and ($_.CommandLine -match 'pamporovo-villa|padaloto-guest-house|server/_core/index.ts|server\\_core\\index.ts') }; foreach ($p in $procs) { Write-Host ('   - Killing PID ' + $p.ProcessId); Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }"

timeout /t 2 /nobreak >nul

set "NODE_OPTIONS=--use-system-ca"

if not exist "node_modules\.bin\tsx.cmd" (
  echo.
  echo [2/3] Installing dependencies ^(node_modules is missing^)...

  where pnpm >nul 2>&1
  if %ERRORLEVEL%==0 (
    echo   - Running: pnpm install
    call pnpm install
  ) else (
    echo   - pnpm not found, running: npm install
    call npm install --legacy-peer-deps
  )

  if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies.
    echo Try manually in this folder:
    echo   pnpm install
    echo or:
    echo   npm install
    echo.
    echo If you see "fetch failed", check your internet connection or VPN.
    pause
    exit /b 1
  )

  if not exist "node_modules\.bin\tsx.cmd" (
    echo.
    echo ERROR: Install finished but tsx is still missing.
    pause
    exit /b 1
  )
) else (
  echo.
  echo [2/3] Dependencies OK.
)

echo.
echo [3/3] Starting application on port %PORT%...

start "%APP_TITLE%" /D "%~dp0" cmd /k start-dev.cmd

echo.
echo Done. Server starting at http://localhost:%PORT%/
echo Logs are in the new window.
echo.
pause
endlocal
