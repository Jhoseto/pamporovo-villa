#Requires -Version 5.1
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
    $map[$line.Substring(0, $idx).Trim()] = $line.Substring($idx + 1).Trim()
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
  throw 'Missing .env.production.local - run: node scripts/generate-production-secrets.mjs'
}

$host_ = Require-Value $cfg "JETHOST_SSH_HOST"
$user = Require-Value $cfg "JETHOST_SSH_USER"
$port = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "22" }
$key = $cfg["JETHOST_SSH_KEY"]
$appDir = if ($cfg["JETHOST_APP_DIR"]) { $cfg["JETHOST_APP_DIR"] } else { "pamporovo-villa" }
$repoBase = if ($cfg["GITHUB_REPO"]) { $cfg["GITHUB_REPO"] } else { "https://github.com/Jhoseto/pamporovo-villa.git" }
$token = $cfg["GITHUB_TOKEN"]
$repo = if ($token) { $repoBase -replace "https://", "https://${token}@" } else { $repoBase }

$sshArgs = @("-p", $port, "-o", "StrictHostKeyChecking=accept-new")
$scpArgs = @("-P", $port, "-o", "StrictHostKeyChecking=accept-new")
if ($key -and (Test-Path $key)) {
  $sshArgs = @("-i", $key) + $sshArgs
  $scpArgs = @("-i", $key) + $scpArgs
}

$remote = "${user}@${host_}"

Write-Host "==> Testing SSH to $remote"
& ssh @sshArgs $remote "echo OK"
if ($LASTEXITCODE -ne 0) { throw "SSH failed" }

# Resolve real home path on server (avoids ~ literal in single-quoted bash)
$homeDir = (& ssh @sshArgs $remote "echo `$HOME").Trim()
if (-not $homeDir) { $homeDir = "/home/${user}" }
$remotePath = "${homeDir}/${appDir}"
Write-Host "    Remote path: $remotePath"

Write-Host "==> Ensuring repo on server"
$cloneCmd = "if [ -d `"$remotePath/.git`" ]; then cd `"$remotePath`" && git fetch origin main && git reset --hard origin/main; elif [ -d `"$remotePath`" ]; then echo 'not a git repo' 1>&2; exit 1; else git clone `"$repo`" `"$remotePath`"; fi"
& ssh @sshArgs $remote $cloneCmd
if ($LASTEXITCODE -ne 0) { throw "Git clone/pull failed" }

Write-Host "==> Uploading .env"
$envContent = Get-Content $prodEnv -Raw -Encoding UTF8
$envContent | & ssh @sshArgs $remote "cat > `"$remotePath/.env`""
if ($LASTEXITCODE -ne 0) { throw "Upload .env failed" }

Write-Host "==> Running first install / deploy on server"
$installCmd = "cd `"$remotePath`" && chmod +x scripts/*.sh && bash scripts/jethost-first-install.sh"
& ssh @sshArgs $remote $installCmd
if ($LASTEXITCODE -ne 0) { throw "Remote install failed" }

$siteUrl = $cfg["SITE_URL"]
Write-Host ""
Write-Host "Deploy finished." -ForegroundColor Green
Write-Host "  Site:  $siteUrl"
Write-Host "  Admin: ${siteUrl}/admin"
Write-Host "  Health: ${siteUrl}/health"
Write-Host ""
Write-Host "If site is not live: cPanel -> Setup Node.js App -> dist/index.js -> Restart" -ForegroundColor Yellow
