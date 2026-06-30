#Requires -Version 5.1
# Sets GitHub Actions secrets for JetHost deploy (requires: gh auth login)
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

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
  exit 1
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: gh auth login" -ForegroundColor Yellow
  exit 1
}

$cfg = Read-EnvFile (Join-Path $Root ".deploy.env")
$host_ = $cfg["JETHOST_SSH_HOST"]
$user = $cfg["JETHOST_SSH_USER"]
$port = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "22" }
$keyPath = $cfg["JETHOST_SSH_KEY"]

if (-not $host_ -or -not $user) {
  Write-Host "Set JETHOST_SSH_HOST and JETHOST_SSH_USER in .deploy.env" -ForegroundColor Yellow
  exit 1
}

gh secret set JETHOST_SSH_HOST --body $host_
gh secret set JETHOST_SSH_USER --body $user
gh secret set JETHOST_SSH_PORT --body $port

if ($keyPath -and (Test-Path $keyPath)) {
  $keyContent = Get-Content -Raw $keyPath
  gh secret set JETHOST_SSH_KEY --body $keyContent
  Write-Host "GitHub secrets configured (including SSH key)." -ForegroundColor Green
} else {
  Write-Host "JETHOST_SSH_KEY not found — set JETHOST_SSH_KEY manually in GitHub Secrets." -ForegroundColor Yellow
}

Write-Host "Auto-deploy on push to main is ready (.github/workflows/deploy-jethost.yml)"
