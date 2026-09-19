# opencodemeva installer for Windows (PowerShell)
# Usage: .\install.ps1 [--target <dir>] [--overwrite] [--dry-run]
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

$NodeCmd = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $NodeCmd) {
    Write-Host "ERROR: Node.js is required but was not found on PATH." -ForegroundColor Red
    Write-Host "Install Node.js >= 18 from https://nodejs.org and re-run this script."
    exit 1
}

$VersionOk = node -e "process.exit(process.versions.node.split('.')[0] < 18 ? 1 : 0)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js 18+ is required (found: $(node --version))." -ForegroundColor Red
    exit 1
}

$Cli = Join-Path $Root "src\cli.js"
& node $Cli install @args
exit $LASTEXITCODE