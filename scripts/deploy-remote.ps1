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

function Invoke-SSH([string[]]$SshArgs, [string]$Remote, [string]$Cmd) {
  & ssh @SshArgs $Remote $Cmd
  if ($LASTEXITCODE -ne 0) { throw "SSH command failed" }
}

# ── Load .deploy.env ──────────────────────────────────────────────────────────
$deployEnvPath = Join-Path $Root ".deploy.env"
if (-not (Test-Path $deployEnvPath)) {
  Write-Host "ERROR: .deploy.env not found." -ForegroundColor Red
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
$sshHost  = $cfg["JETHOST_SSH_HOST"]
$sshUser  = $cfg["JETHOST_SSH_USER"]
$sshPort  = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "1022" }
$sshKey   = $cfg["JETHOST_SSH_KEY"]
$appDir   = if ($cfg["JETHOST_APP_DIR"]) { $cfg["JETHOST_APP_DIR"] } else { "pamporovo-villa" }
$repo     = if ($cfg["GITHUB_REPO"]) { $cfg["GITHUB_REPO"] } else { "https://github.com/Jhoseto/pamporovo-villa.git" }
$token    = $cfg["GITHUB_TOKEN"]
if ($token) { $repo = $repo.Replace("https://", "https://${token}@") }

$remote   = "${sshUser}@${sshHost}"
$sshBase  = @("-p", $sshPort, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=20", "-o", "ServerAliveInterval=30")
if ($sshKey -and (Test-Path $sshKey)) {
  $sshBase = @("-i", $sshKey) + $sshBase
}

# ── Generate production secrets ───────────────────────────────────────────────
if (-not $SkipSecrets) {
  Write-Host "==> Generating production secrets"
  & node (Join-Path $Root "scripts/generate-production-secrets.mjs")
}
$prodEnv = Join-Path $Root ".env.production.local"
if (-not (Test-Path $prodEnv)) {
  throw "Missing .env.production.local - run: node scripts/generate-production-secrets.mjs"
}

# ── Build locally (avoids OOM on shared hosting) ─────────────────────────────
if (-not $SkipBuild) {
  Write-Host "==> Building locally (vite + esbuild)"
  $env:NODE_ENV = "production"
  $env:NODE_OPTIONS = "--use-system-ca"
  $env:PNPM_CONFIG_UPDATE_NOTIFIER = "false"
  & pnpm build
  if ($LASTEXITCODE -ne 0) { throw "Local build failed" }
  $env:NODE_ENV = $null
  $env:NODE_OPTIONS = $null
  $env:PNPM_CONFIG_UPDATE_NOTIFIER = $null
  Write-Host "    Build OK"
}
$distPath = Join-Path $Root "dist"
if (-not (Test-Path $distPath)) { throw "dist/ not found - build failed" }

# ── Test SSH ──────────────────────────────────────────────────────────────────
Write-Host "==> Testing SSH to ${remote} (port ${sshPort})"
& ssh @sshBase $remote "echo OK"
if ($LASTEXITCODE -ne 0) { throw "SSH connection failed" }

$homeDir = (& ssh @sshBase $remote 'echo $HOME').Trim()
if (-not $homeDir) { $homeDir = "/home/${sshUser}" }
$remotePath = "${homeDir}/${appDir}"
Write-Host "    Remote: $remotePath"

# ── Clone or update repo ──────────────────────────────────────────────────────
Write-Host "==> Syncing repo on server"
# Use single-quoted string then substitute - avoids PS parsing && as operator
$cloneCmd = 'if [ -d "RP/.git" ]; then cd "RP" && git fetch origin main && git reset --hard origin/main; else git clone "REPO" "RP"; fi'
$cloneCmd = $cloneCmd.Replace("RP", $remotePath).Replace("REPO", $repo)
Invoke-SSH $sshBase $remote $cloneCmd

# ── Upload .env ───────────────────────────────────────────────────────────────
Write-Host "==> Uploading .env"
$envDest = 'cat > "RP/.env"'.Replace("RP", $remotePath)
Get-Content $prodEnv -Raw -Encoding UTF8 | & ssh @sshBase $remote $envDest
if ($LASTEXITCODE -ne 0) { throw "Upload .env failed" }

# ── Upload dist/ via scp (binary-safe, no pipe corruption) ───────────────────
Write-Host "==> Uploading dist/ (tar + scp)"
$tmpTar = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "pamporovo-dist.tar.gz")
& tar -czf $tmpTar -C $Root dist
if ($LASTEXITCODE -ne 0) { throw "tar failed - Git for Windows includes tar; ensure it is in PATH" }

# scp uses -P (capital) for port, unlike ssh which uses -p
$scpBase = @("-P", $sshPort, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=20")
if ($sshKey -and (Test-Path $sshKey)) { $scpBase = @("-i", $sshKey) + $scpBase }
$remoteTar = "~/pamporovo-dist.tar.gz"
& scp @scpBase $tmpTar "${remote}:${remoteTar}"
if ($LASTEXITCODE -ne 0) { throw "scp dist.tar.gz failed" }
Remove-Item $tmpTar -Force -ErrorAction SilentlyContinue

$extractCmd = 'cd "RP" && rm -rf dist && tar -xzf ~/pamporovo-dist.tar.gz && rm ~/pamporovo-dist.tar.gz'
$extractCmd = $extractCmd.Replace("RP", $remotePath)
Invoke-SSH $sshBase $remote $extractCmd
Write-Host "    dist/ uploaded OK"

# ── Server-side deploy (prod deps + db sync + restart) ───────────────────────
Write-Host "==> Running server-side deploy"
$deployCmd = 'cd "RP" && chmod +x scripts/*.sh && bash scripts/deploy.sh'.Replace("RP", $remotePath)
Invoke-SSH $sshBase $remote $deployCmd

# ── Done ──────────────────────────────────────────────────────────────────────
$siteUrl = $cfg["SITE_URL"]
Write-Host ""
Write-Host "Deploy finished!" -ForegroundColor Green
Write-Host "  Site:   ${siteUrl}/" -ForegroundColor Cyan
Write-Host "  Admin:  ${siteUrl}/admin" -ForegroundColor Cyan
Write-Host "  Health: ${siteUrl}/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "If site shows 503: cPanel > Setup Node.js App > pamporovo-villa > Restart" -ForegroundColor Yellow
