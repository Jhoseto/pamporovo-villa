@echo off
cd /d "%~dp0"
set NODE_ENV=development
set PORT=3000
set NODE_OPTIONS=--use-system-ca
node_modules\.bin\tsx.cmd watch server/_core/index.ts
