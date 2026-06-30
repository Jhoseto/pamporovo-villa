#Requires -Version 5.1
param([switch]$SkipBuild, [switch]$SkipSecrets)

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
  Write-Host "ERROR: .deploy.env not found. Copy .deploy.env.example and fill it in." -ForegroundColor Red
  exit 1
}
$cfg = Read-EnvFile $deployEnvPath

$missing = @("JETHOST_SSH_HOST","JETHOST_SSH_USER","DATABASE_URL","SITE_URL") | Where-Object {
  [string]::IsNullOrWhiteSpace($cfg[$_]) -or $cfg[$_] -match 'CHANGE_THIS|YOUR-TEMP|DB_USER|DB_PASSWORD'
}
if ($missing.Count -gt 0) {
  Write-Host "Fill these in .deploy.env first:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  $_" }
  exit 1
}

# ── SSH params ────────────────────────────────────────────────────────────────
$sshHost = $cfg["JETHOST_SSH_HOST"]
$sshUser = $cfg["JETHOST_SSH_USER"]
$sshPort = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "1022" }
$sshKey  = $cfg["JETHOST_SSH_KEY"]
$appDir  = if ($cfg["JETHOST_APP_DIR"]) { $cfg["JETHOST_APP_DIR"] } else { "pamporovo-villa" }
$repo    = if ($cfg["GITHUB_REPO"]) { $cfg["GITHUB_REPO"] } else { "https://github.com/Jhoseto/pamporovo-villa.git" }
$token   = $cfg["GITHUB_TOKEN"]
if ($token) { $repo = $repo -replace "https://", "https://${token}@" }

$remote  = "${sshUser}@${sshHost}"
$sshBase = @("-p", $sshPort, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=20", "-o", "ServerAliveInterval=30")
if ($sshKey -and (Test-Path $sshKey)) {
  $sshBase = @("-i", $sshKey) + $sshBase
}

function Invoke-SSH([string]$Cmd, [string]$Desc = "") {
  if ($Desc) { Write-Host "==> $Desc" }
  & ssh @sshBase $remote $Cmd
  if ($LASTEXITCODE -ne 0) { throw "SSH failed${if($Desc){`: $Desc`}}" }
}

# ── Generate production secrets ───────────────────────────────────────────────
if (-not $SkipSecrets) {
  Write-Host "==> Generating production secrets"
  node (Join-Path $Root "scripts/generate-production-secrets.mjs")
}
$prodEnv = Join-Path $Root ".env.production.local"
if (-not (Test-Path $prodEnv)) { throw "Missing .env.production.local — run: node scripts/generate-production-secrets.mjs" }

# ── Build locally (avoids OOM on shared hosting server) ──────────────────────
if (-not $SkipBuild) {
  Write-Host "==> Building locally (vite + esbuild)"
  $env:NODE_ENV = "production"
  & pnpm build
  if ($LASTEXITCODE -ne 0) { throw "Local build failed" }
  $env:NODE_ENV = ""
  Write-Host "    Build OK"
}

# ── Test SSH ──────────────────────────────────────────────────────────────────
Write-Host "==> Testing SSH to $remote (port $sshPort)"
& ssh @sshBase $remote "echo OK"
if ($LASTEXITCODE -ne 0) { throw "SSH connection failed" }

$homeDir = (& ssh @sshBase $remote 'echo $HOME').Trim()
if (-not $homeDir) { $homeDir = "/home/${sshUser}" }
$remotePath = "${homeDir}/${appDir}"
Write-Host "    Remote: $remotePath"

# ── Clone or update repo ──────────────────────────────────────────────────────
Write-Host "==> Syncing repo on server"
$cloneCmd = "if [ -d \`"$remotePath/.git\`" ]; then cd \`"$remotePath\`" && git fetch origin main && git reset --hard origin/main; else git clone \`"$repo\`" \`"$remotePath\`"; fi"
Invoke-SSH $cloneCmd

# ── Upload .env ───────────────────────────────────────────────────────────────
Write-Host "==> Uploading .env"
Get-Content $prodEnv -Raw -Encoding UTF8 | & ssh @sshBase $remote "cat > `"$remotePath/.env`""
if ($LASTEXITCODE -ne 0) { throw "Upload .env failed" }

# ── Upload dist/ (built locally — avoids memory issues on server) ─────────────
Write-Host "==> Uploading dist/ (tar over SSH)"
$distPath = Join-Path $Root "dist"
if (-not (Test-Path $distPath)) { throw "dist/ not found — build must have failed" }

# tar the dist folder and pipe it directly to the server
$tarCmd = "cd `"$Root`" && tar -czf - dist"
$extractCmd = "cd `"$remotePath`" && rm -rf dist && tar -xzf -"
& bash -c $tarCmd | & ssh @sshBase $remote $extractCmd
if ($LASTEXITCODE -ne 0) {
  # Fallback: use PowerShell + OpenSSH without bash
  Write-Host "    (retrying with PowerShell tar)"
  $tmpTar = [System.IO.Path]::GetTempFileName() + ".tar.gz"
  & tar -czf $tmpTar -C $Root dist
  if ($LASTEXITCODE -ne 0) { throw "tar failed" }
  Get-Content $tmpTar -Raw -AsByteStream | & ssh @sshBase $remote "cd `"$remotePath`" && rm -rf dist && tar -xzf - "
  Remove-Item $tmpTar -Force
}
Write-Host "    dist/ uploaded"

# ── Run server-side deploy (prod deps only + db sync + restart) ───────────────
Write-Host "==> Running server-side deploy"
Invoke-SSH "cd `"$remotePath`" && chmod +x scripts/*.sh && bash scripts/deploy.sh"

# ── Done ──────────────────────────────────────────────────────────────────────
$siteUrl = $cfg["SITE_URL"]
Write-Host ""
Write-Host "Deploy finished!" -ForegroundColor Green
Write-Host "  Site:   $siteUrl/" -ForegroundColor Cyan
Write-Host "  Admin:  ${siteUrl}/admin" -ForegroundColor Cyan
Write-Host "  Health: ${siteUrl}/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "If site shows 503: cPanel > Setup Node.js App > pamporovo-villa > Restart" -ForegroundColor Yellow
