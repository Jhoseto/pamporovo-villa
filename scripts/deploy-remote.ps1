#Requires -Version 5.1
param([switch]$SkipSecrets)

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
    $map[$line.Substring(0, $idx).Trim()] = $line.Substring($idx + 1).Trim()
  }
  return $map
}

# ── Load .deploy.env ──────────────────────────────────────────────────────────
$deployEnvPath = Join-Path $Root ".deploy.env"
if (-not (Test-Path $deployEnvPath)) {
  Copy-Item (Join-Path $Root ".deploy.env.example") $deployEnvPath
  Write-Host "Created .deploy.env - fill in the required fields and run again." -ForegroundColor Yellow
  exit 1
}
$cfg = Read-EnvFile $deployEnvPath

$missing = @("JETHOST_SSH_HOST","JETHOST_SSH_USER","DATABASE_URL","SITE_URL") | Where-Object {
  [string]::IsNullOrWhiteSpace($cfg[$_]) -or $cfg[$_] -match 'YOUR-TEMP|DB_USER|DB_PASSWORD|DB_NAME'
}
if ($missing.Count -gt 0) {
  Write-Host "Fill these in .deploy.env first:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  $_" }
  exit 1
}

# ── Generate production secrets ───────────────────────────────────────────────
if (-not $SkipSecrets) {
  Write-Host "==> Generating production secrets"
  node (Join-Path $Root "scripts/generate-production-secrets.mjs")
}

$prodEnv = Join-Path $Root ".env.production.local"
if (-not (Test-Path $prodEnv)) {
  throw 'Run first: node scripts/generate-production-secrets.mjs'
}

# ── SSH config ────────────────────────────────────────────────────────────────
$sshHost = $cfg["JETHOST_SSH_HOST"]
$sshUser = $cfg["JETHOST_SSH_USER"]
$sshPort = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "1022" }
$sshKey  = $cfg["JETHOST_SSH_KEY"]
$appDir  = if ($cfg["JETHOST_APP_DIR"]) { $cfg["JETHOST_APP_DIR"] } else { "pamporovo-villa" }
$repo    = if ($cfg["GITHUB_REPO"]) { $cfg["GITHUB_REPO"] } else { "https://github.com/Jhoseto/pamporovo-villa.git" }
$token   = $cfg["GITHUB_TOKEN"]
if ($token) { $repo = $repo -replace "https://", "https://${token}@" }

$remote = "${sshUser}@${sshHost}"
$sshBase = @("-p", $sshPort, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=15")
if ($sshKey -and (Test-Path $sshKey)) {
  $sshBase = @("-i", $sshKey) + $sshBase
}

function Invoke-SSH([string]$Cmd) {
  & ssh @sshBase $remote $Cmd
  if ($LASTEXITCODE -ne 0) { throw "SSH command failed: $Cmd" }
}

# ── Test connection ───────────────────────────────────────────────────────────
Write-Host "==> Testing SSH → $remote (port $sshPort)"
& ssh @sshBase $remote "echo OK"
if ($LASTEXITCODE -ne 0) { throw "SSH connection failed" }

# ── Resolve home directory (avoids ~ literal bug) ────────────────────────────
$homeDir = (& ssh @sshBase $remote 'echo $HOME').Trim()
if (-not $homeDir) { $homeDir = "/home/${sshUser}" }
$remotePath = "${homeDir}/${appDir}"
Write-Host "    Remote path: $remotePath"

# ── Clone or update repo ──────────────────────────────────────────────────────
Write-Host "==> Syncing repo on server"
$cloneCmd = "if [ -d \`"$remotePath/.git\`" ]; then cd \`"$remotePath\`" && git fetch origin main && git reset --hard origin/main; else git clone \`"$repo\`" \`"$remotePath\`"; fi"
Invoke-SSH $cloneCmd

# ── Upload .env ───────────────────────────────────────────────────────────────
Write-Host "==> Uploading .env"
$envContent = Get-Content $prodEnv -Raw -Encoding UTF8
$envContent | & ssh @sshBase $remote "cat > `"$remotePath/.env`""
if ($LASTEXITCODE -ne 0) { throw "Upload .env failed" }

# ── Run deploy on server ──────────────────────────────────────────────────────
Write-Host "==> Running deploy on server (install → build → db:sync)"
Invoke-SSH "cd `"$remotePath`" && chmod +x scripts/*.sh && bash scripts/jethost-first-install.sh"

# ── Done ──────────────────────────────────────────────────────────────────────
$siteUrl = $cfg["SITE_URL"]
Write-Host ""
Write-Host "Deploy finished!" -ForegroundColor Green
Write-Host "  Site:   $siteUrl" -ForegroundColor Cyan
Write-Host "  Admin:  ${siteUrl}/admin" -ForegroundColor Cyan
Write-Host "  Health: ${siteUrl}/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "If site shows 503: cPanel → Setup Node.js App → pamporovo-villa → Restart" -ForegroundColor Yellow
