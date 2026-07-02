#Requires -Version 5.1
# Prints GitHub Actions secret names + values from .env and .deploy.env
# Use when gh CLI is not installed — paste manually in GitHub → Settings → Secrets
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

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

$deploy = Read-EnvFile (Join-Path $Root ".deploy.env")
$envMap = Read-EnvFile (Join-Path $Root ".env")

if ($envMap.Count -eq 0) {
  Write-Host "ERROR: .env not found" -ForegroundColor Red
  exit 1
}

$port = if ($deploy["JETHOST_SSH_PORT"]) { $deploy["JETHOST_SSH_PORT"] } else { "1022" }
$keyPath = $deploy["JETHOST_SSH_KEY"]
$sshKey = if ($keyPath -and (Test-Path $keyPath)) { Get-Content -Raw $keyPath } else { "" }

$appDirDefault = if ($deploy["JETHOST_APP_DIR"]) { $deploy["JETHOST_APP_DIR"] } else { "pamporovo-villa" }

$secrets = [ordered]@{
  JETHOST_SSH_HOST         = $deploy["JETHOST_SSH_HOST"]
  JETHOST_SSH_USER         = $deploy["JETHOST_SSH_USER"]
  JETHOST_SSH_PORT         = $port
  JETHOST_APP_DIR          = $appDirDefault
  JETHOST_SSH_KEY          = $sshKey
  DATABASE_URL             = (Convert-ToProductionDatabaseUrl $envMap["DATABASE_URL"])
  SITE_URL                 = $envMap["SITE_URL"]
  JWT_SECRET               = $envMap["JWT_SECRET"]
  MASTER_ADMIN_PASSWORD    = $envMap["MASTER_ADMIN_PASSWORD"]
  VAPID_PUBLIC_KEY         = $envMap["VAPID_PUBLIC_KEY"]
  VAPID_PRIVATE_KEY        = $envMap["VAPID_PRIVATE_KEY"]
  MAILJET_API_KEY          = $envMap["MAILJET_API_KEY"]
  MAILJET_API_SECRET       = $envMap["MAILJET_API_SECRET"]
  MAIL_FROM_EMAIL          = $envMap["MAIL_FROM_EMAIL"]
  MAIL_FROM_NAME           = $envMap["MAIL_FROM_NAME"]
  SUPPORT_EMAIL            = $envMap["SUPPORT_EMAIL"]
  SMTP_REPLY_TO            = $envMap["SMTP_REPLY_TO"]
}

Write-Host ""
Write-Host "GitHub Secrets (Settings → Secrets and variables → Actions)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

foreach ($entry in $secrets.GetEnumerator()) {
  $name = $entry.Key
  $value = $entry.Value
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "$name = (empty - skip or fill in .env)" -ForegroundColor Yellow
  } elseif ($name -eq "JETHOST_SSH_KEY") {
    Write-Host "$name = (paste full private key - $($value.Length) chars)" -ForegroundColor Green
  } elseif ($name -match "PASSWORD|SECRET|KEY|PRIVATE") {
    Write-Host "$name = *** ($($value.Length) chars)" -ForegroundColor Green
  } else {
    Write-Host "$name = $value" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "Install gh CLI then run: pnpm deploy:github-secrets" -ForegroundColor Yellow
