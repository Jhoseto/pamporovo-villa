#Requires -Version 5.1
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$target = Join-Path $Root ".deploy.env"
$example = Join-Path $Root ".deploy.env.example"

if (Test-Path $target) {
  Write-Host ".deploy.env already exists. Edit it, then run: pnpm deploy:remote"
  exit 0
}

Copy-Item $example $target
Write-Host "Created .deploy.env"
Write-Host "Fill in: JETHOST_SSH_HOST, JETHOST_SSH_USER, DATABASE_URL, SITE_URL"
Write-Host "Then run: pnpm deploy:remote"
