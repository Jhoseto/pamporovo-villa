@echo off
setlocal
cd /d "%~dp0"
rem Windows Node.js may fail DeepL HTTPS without system CA store
set NODE_OPTIONS=--use-system-ca
echo [i18n-sync] Updating locale files from Bulgarian source...
call pnpm i18n:sync %*
set SYNC_EXIT=%ERRORLEVEL%
if not "%SYNC_EXIT%"=="0" (
  echo [i18n-sync] Failed with exit code %SYNC_EXIT%.
  exit /b %SYNC_EXIT%
)
echo [i18n-sync] Done.
exit /b 0
