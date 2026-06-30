#Requires -Version 5.1
<#
.SYNOPSIS
  One-command deploy to JetHost from Windows.

.DESCRIPTION
  1. Reads .deploy.env (creates from .deploy.env.example if missing)
  2. Generates .env.production.local with secrets
  3. SSH: clone/pull repo on server
  4. Uploads .env and runs jethost-first-install.sh

  Prerequisites: OpenSSH client, Node.js, pnpm, filled .deploy.env

.EXAMPLE
  pnpm deploy:remote
#>
param(
  [switch]$SkipSecrets,
  [switch]$SetupOnly
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Read-EnvFile([string]$Path) {
  $map = @{}
  if (-not (Test-Path $Path)) { return $map }
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    $map[$key] = $val
  }
  return $map
}

function Require-Value($map, [string]$Key) {
  $v = $map[$Key]
  if ([string]::IsNullOrWhiteSpace($v)) {
    throw "Missing $Key in .deploy.env"
  }
  return $v
}

$deployEnvPath = Join-Path $Root ".deploy.env"
$examplePath = Join-Path $Root ".deploy.env.example"

if (-not (Test-Path $deployEnvPath)) {
  Copy-Item $examplePath $deployEnvPath
  Write-Host ""
  Write-Host "Created .deploy.env - fill in SSH + DATABASE_URL + SITE_URL, then run again:" -ForegroundColor Yellow
  Write-Host "  pnpm deploy:remote" -ForegroundColor Cyan
  Write-Host ""
  if ($SetupOnly) { exit 0 }
  exit 1
}

$cfg = Read-EnvFile $deployEnvPath

if ($SetupOnly) {
  Write-Host ".deploy.env exists. Edit it and run pnpm deploy:remote"
  exit 0
}

$missing = @("JETHOST_SSH_HOST", "JETHOST_SSH_USER", "DATABASE_URL", "SITE_URL") | Where-Object {
  [string]::IsNullOrWhiteSpace($cfg[$_]) -or $cfg[$_] -match 'YOUR-TEMP|DB_USER|DB_PASSWORD|DB_NAME'
}
if ($missing.Count -gt 0) {
  Write-Host "Fill these in .deploy.env before deploy:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  - $_" }
  exit 1
}

if (-not $SkipSecrets) {
  Write-Host "==> Generating production secrets"
  node (Join-Path $Root "scripts/generate-production-secrets.mjs")
}

$prodEnv = Join-Path $Root ".env.production.local"
if (-not (Test-Path $prodEnv)) {
  throw "Missing .env.production.local — run: node scripts/generate-production-secrets.mjs"
}

$host_ = Require-Value $cfg "JETHOST_SSH_HOST"
$user = Require-Value $cfg "JETHOST_SSH_USER"
$port = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "22" }
$key = $cfg["JETHOST_SSH_KEY"]
$appDir = if ($cfg["JETHOST_APP_DIR"]) { $cfg["JETHOST_APP_DIR"] } else { "pamporovo-villa" }
$repo = if ($cfg["GITHUB_REPO"]) { $cfg["GITHUB_REPO"] } else { "https://github.com/Jhoseto/pamporovo-villa.git" }

$sshArgs = @("-p", $port, "-o", "StrictHostKeyChecking=accept-new")
$scpArgs = @("-P", $port, "-o", "StrictHostKeyChecking=accept-new")
if ($key -and (Test-Path $key)) {
  $sshArgs = @("-i", $key) + $sshArgs
  $scpArgs = @("-i", $key) + $scpArgs
}

$remote = "${user}@${host_}"
$remotePath = "~/${appDir}"

Write-Host "==> Testing SSH to $remote"
& ssh @sshArgs $remote "echo OK"
if ($LASTEXITCODE -ne 0) { throw "SSH failed" }

Write-Host "==> Ensuring repo on server"
$cloneCmd = @"
if [ -d '$remotePath/.git' ]; then
  cd '$remotePath' && git fetch origin main && git reset --hard origin/main
elif [ -d '$remotePath' ]; then
  echo 'Directory exists but is not a git repo' >&2; exit 1
else
  git clone '$repo' '$remotePath'
fi
"@ -replace "`r", ""
& ssh @sshArgs $remote $cloneCmd
if ($LASTEXITCODE -ne 0) { throw "Git clone/pull failed" }

Write-Host "==> Uploading .env"
& scp @scpArgs $prodEnv "${remote}:${remotePath}/.env"
if ($LASTEXITCODE -ne 0) { throw "SCP .env failed" }

Write-Host "==> Running first install / deploy on server"
& ssh @sshArgs $remote "cd '$remotePath' && chmod +x scripts/*.sh && bash scripts/jethost-first-install.sh"
if ($LASTEXITCODE -ne 0) { throw "Remote install failed" }

$siteUrl = $cfg["SITE_URL"]
Write-Host ""
Write-Host "Deploy finished." -ForegroundColor Green
Write-Host "  Site:  $siteUrl"
Write-Host "  Admin: ${siteUrl}/admin"
Write-Host "  Health: ${siteUrl}/health"
Write-Host ""
Write-Host "If site is not live: cPanel -> Setup Node.js App -> dist/index.js -> Restart" -ForegroundColor Yellow
