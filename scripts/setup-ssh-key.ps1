#Requires -Version 5.1
# Generates SSH key (if missing) and copies it to JetHost server.
# Run once: pnpm ssh:setup
# After that pnpm deploy:remote works without password prompts.

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

$cfg = Read-EnvFile (Join-Path $Root ".deploy.env")
$host_ = $cfg["JETHOST_SSH_HOST"]
$user = $cfg["JETHOST_SSH_USER"]
$port = if ($cfg["JETHOST_SSH_PORT"]) { $cfg["JETHOST_SSH_PORT"] } else { "1022" }
$keyPath = $cfg["JETHOST_SSH_KEY"]
$password = $cfg["JETHOST_SSH_PASSWORD"]

if (-not $host_ -or -not $user) {
  Write-Host "Fill JETHOST_SSH_HOST and JETHOST_SSH_USER in .deploy.env" -ForegroundColor Red
  exit 1
}
if (-not $keyPath) {
  $keyPath = "$env:USERPROFILE\.ssh\id_ed25519_jethost"
}

# Generate key if missing
if (-not (Test-Path $keyPath)) {
  Write-Host "==> Generating SSH key: $keyPath"
  $sshDir = Split-Path $keyPath
  if (-not (Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }
  & ssh-keygen -t ed25519 -C "jethost-deploy" -f $keyPath -N '""'
  if ($LASTEXITCODE -ne 0) { throw "ssh-keygen failed" }
} else {
  Write-Host "==> SSH key exists: $keyPath"
}

$pubKey = Get-Content "$keyPath.pub" -Raw
$pubKey = $pubKey.Trim()
Write-Host "==> Public key: $pubKey"

# Copy public key to server
if ($password) {
  Write-Host "==> Copying key to server (using password)..."

  # Check if plink is available (PuTTY)
  $plink = Get-Command plink -ErrorAction SilentlyContinue
  if ($plink) {
    $cmd = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$pubKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo KEY_ADDED"
    $result = echo "y" | & plink -P $port -pw $password "${user}@${host_}" $cmd 2>&1
    Write-Host $result
  } else {
    Write-Host ""
    Write-Host "plink (PuTTY) not found - add the key manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. cPanel -> Security -> SSH dostup -> Manage SSH Keys -> Import Key" -ForegroundColor Cyan
    Write-Host "2. Paste this public key:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $pubKey -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Click Authorize" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After that run: pnpm deploy:remote" -ForegroundColor Green
    exit 0
  }
} else {
  Write-Host ""
  Write-Host "No JETHOST_SSH_PASSWORD in .deploy.env." -ForegroundColor Yellow
  Write-Host "Add the public key manually in cPanel -> SSH dostup -> Manage SSH Keys -> Import Key:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host $pubKey -ForegroundColor Green
}

Write-Host ""
Write-Host "SSH key setup done. Run: pnpm deploy:remote" -ForegroundColor Green
