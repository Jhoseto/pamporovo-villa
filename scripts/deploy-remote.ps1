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

function Convert-ToProductionDatabaseUrl([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) { return $Url }
  return $Url -replace '@127\.0\.0\.1:3307/', '@localhost:3306/'
}

function Build-ProductionEnvContent([string]$EnvPath, [hashtable]$Overrides) {
  if (-not (Test-Path $EnvPath)) {
    throw "Missing .env — copy .env.example to .env and fill in values"
  }
  $lines = Get-Content $EnvPath -Encoding UTF8
  $seen = @{}
  $out = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
      $out.Add($line)
      continue
    }
    $idx = $trimmed.IndexOf("=")
    if ($idx -lt 1) {
      $out.Add($line)
      continue
    }
    $key = $trimmed.Substring(0, $idx).Trim()
    if ($key -in @("NODE_ENV", "TRUST_PROXY")) { continue }
    $seen[$key] = $true
    if ($Overrides.ContainsKey($key) -and -not [string]::IsNullOrWhiteSpace($Overrides[$key])) {
      $out.Add("${key}=$($Overrides[$key])")
    } else {
      $out.Add($line)
    }
  }

  foreach ($key in $Overrides.Keys) {
    if ($key -in @("NODE_ENV", "TRUST_PROXY")) { continue }
    if (-not $seen[$key] -and -not [string]::IsNullOrWhiteSpace($Overrides[$key])) {
      $out.Add("${key}=$($Overrides[$key])")
    }
  }

  $final = New-Object System.Collections.Generic.List[string]
  $final.Add("NODE_ENV=production")
  $final.Add("TRUST_PROXY=1")
  foreach ($line in $out) { $final.Add($line) }
  return ($final -join "`n") + "`n"
}

function Invoke-SSH([string[]]$SshArgs, [string]$Remote, [string]$Cmd) {
  & ssh @SshArgs $Remote $Cmd
  if ($LASTEXITCODE -ne 0) { throw "SSH command failed" }
}

# ── Load .deploy.env (SSH only) ───────────────────────────────────────────────
$deployEnvPath = Join-Path $Root ".deploy.env"
if (-not (Test-Path $deployEnvPath)) {
  Write-Host "ERROR: .deploy.env not found." -ForegroundColor Red
  Write-Host "Copy .deploy.env.example to .deploy.env and fill SSH credentials." -ForegroundColor Yellow
  exit 1
}
$cfg = Read-EnvFile $deployEnvPath

$missing = @("JETHOST_SSH_HOST", "JETHOST_SSH_USER") | Where-Object {
  [string]::IsNullOrWhiteSpace($cfg[$_])
}
if ($missing.Count -gt 0) {
  Write-Host "Fill these in .deploy.env first:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  $_" }
  exit 1
}

$appEnvPath = Join-Path $Root ".env"
$appEnv = Read-EnvFile $appEnvPath

if (-not (Test-Path $appEnvPath)) {
  Write-Host "ERROR: .env not found. Copy .env.example to .env first." -ForegroundColor Red
  exit 1
}

$overrides = @{
  "DATABASE_URL" = (Convert-ToProductionDatabaseUrl $appEnv["DATABASE_URL"])
}

$dbUrl = $overrides["DATABASE_URL"]
$siteUrl = $appEnv["SITE_URL"]
if ([string]::IsNullOrWhiteSpace($dbUrl) -or $dbUrl -match 'DB_USER|DB_PASSWORD|CHANGE') {
  Write-Host "Set DATABASE_URL in .env" -ForegroundColor Yellow
  exit 1
}
if ([string]::IsNullOrWhiteSpace($siteUrl) -or $siteUrl -match 'YOUR-TEMP|CHANGE') {
  Write-Host "Set SITE_URL in .env to production URL (https://...)" -ForegroundColor Yellow
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

# ── Generate missing secrets into .env ────────────────────────────────────────
if (-not $SkipSecrets) {
  Write-Host "==> Filling missing secrets in .env"
  & node (Join-Path $Root "scripts/generate-production-secrets.mjs")
  $appEnv = Read-EnvFile $appEnvPath
}

$prodEnvContent = Build-ProductionEnvContent $appEnvPath $overrides

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
$cloneCmd = 'if [ -d "RP/.git" ]; then cd "RP" && git fetch origin main && git reset --hard origin/main; else git clone "REPO" "RP"; fi'
$cloneCmd = $cloneCmd.Replace("RP", $remotePath).Replace("REPO", $repo)
Invoke-SSH $sshBase $remote $cloneCmd

# ── Upload .env (production snapshot — local .env stays unchanged) ─────────────
Write-Host "==> Uploading .env"
$envDest = 'cat > "RP/.env"'.Replace("RP", $remotePath)
$prodEnvContent | & ssh @sshBase $remote $envDest
if ($LASTEXITCODE -ne 0) { throw "Upload .env failed" }

# ── Upload dist/ via scp (binary-safe, no pipe corruption) ───────────────────
Write-Host "==> Uploading dist/ (tar + scp)"
$tmpTar = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "pamporovo-dist.tar.gz")
& tar -czf $tmpTar -C $Root dist
if ($LASTEXITCODE -ne 0) { throw "tar failed - Git for Windows includes tar; ensure it is in PATH" }

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
Write-Host ""
Write-Host "Deploy finished!" -ForegroundColor Green
Write-Host "  Site:   ${siteUrl}/" -ForegroundColor Cyan
Write-Host "  Admin:  ${siteUrl}/admin" -ForegroundColor Cyan
Write-Host "  Health: ${siteUrl}/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "If site shows 503: cPanel > Setup Node.js App > pamporovo-villa > Restart" -ForegroundColor Yellow
