@echo off
setlocal
cd /d "%~dp0"
rem Windows Node.js may fail DeepL HTTPS without system CA store
set NODE_OPTIONS=--use-system-ca
echo [i18n-sync] Updating locale files from Bulgarian source...
call pnpm i18n:sync %*
if errorlevel 1 (
  echo [i18n-sync] Failed.
  exit /b 1
)
echo [i18n-sync] Done.
exit /b 0
