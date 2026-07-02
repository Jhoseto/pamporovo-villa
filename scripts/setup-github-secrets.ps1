#Requires -Version 5.1
# Sets ALL GitHub Actions secrets needed by .github/workflows/deploy.yml
# Requires: gh auth login
# Alternative (no gh): scripts/print-github-secrets.ps1
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

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "GitHub CLI (gh) not found." -ForegroundColor Yellow
  Write-Host "Install: https://cli.github.com/" -ForegroundColor Yellow
  Write-Host "Or run:  pnpm deploy:github-secrets:print" -ForegroundColor Yellow
  exit 1
}
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Run: gh auth login" -ForegroundColor Yellow; exit 1 }

$deploy = Read-EnvFile (Join-Path $Root ".deploy.env")
$envMap = Read-EnvFile (Join-Path $Root ".env")

if ($envMap.Count -eq 0) {
  Write-Host "ERROR: .env not found. Copy .env.example to .env first." -ForegroundColor Red
  exit 1
}

function Set-Secret([string]$Name, [string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) {
    Write-Host "  SKIP $Name (empty)" -ForegroundColor Yellow
    return
  }
  gh secret set $Name --body $Value
  Write-Host "  OK   $Name" -ForegroundColor Green
}

Write-Host "==> Setting GitHub Actions secrets..."

$port = if ($deploy["JETHOST_SSH_PORT"]) { $deploy["JETHOST_SSH_PORT"] } else { "1022" }
Set-Secret "JETHOST_SSH_HOST" $deploy["JETHOST_SSH_HOST"]
Set-Secret "JETHOST_SSH_USER" $deploy["JETHOST_SSH_USER"]
Set-Secret "JETHOST_SSH_PORT" $port
Set-Secret "JETHOST_APP_DIR"  $(if ($deploy["JETHOST_APP_DIR"]) { $deploy["JETHOST_APP_DIR"] } else { "pamporovo-villa" })

$keyPath = $deploy["JETHOST_SSH_KEY"]
if ($keyPath -and (Test-Path $keyPath)) {
  Set-Secret "JETHOST_SSH_KEY" (Get-Content -Raw $keyPath)
} else {
  Write-Host "  SKIP JETHOST_SSH_KEY (file not found: $keyPath)" -ForegroundColor Yellow
}

Set-Secret "DATABASE_URL"          (Convert-ToProductionDatabaseUrl $envMap["DATABASE_URL"])
Set-Secret "SITE_URL"              $envMap["SITE_URL"]
Set-Secret "JWT_SECRET"            $envMap["JWT_SECRET"]
Set-Secret "MASTER_ADMIN_PASSWORD" $envMap["MASTER_ADMIN_PASSWORD"]
Set-Secret "VAPID_PUBLIC_KEY"      $envMap["VAPID_PUBLIC_KEY"]
Set-Secret "VAPID_PRIVATE_KEY"     $envMap["VAPID_PRIVATE_KEY"]
Set-Secret "MAILJET_API_KEY"       $envMap["MAILJET_API_KEY"]
Set-Secret "MAILJET_API_SECRET"    $envMap["MAILJET_API_SECRET"]
Set-Secret "MAIL_FROM_EMAIL"       $envMap["MAIL_FROM_EMAIL"]
Set-Secret "MAIL_FROM_NAME"        $envMap["MAIL_FROM_NAME"]
Set-Secret "SUPPORT_EMAIL"         $envMap["SUPPORT_EMAIL"]
Set-Secret "SMTP_REPLY_TO"         $envMap["SMTP_REPLY_TO"]

Write-Host ""
Write-Host "Done! GitHub Actions will deploy automatically on push to main." -ForegroundColor Green
Write-Host "Workflow: .github/workflows/deploy.yml"
