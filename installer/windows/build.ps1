# Builds the Windows patch installer (.exe) with Inno Setup.
# Stages the pack from the repo root into installer\_stage, runs ISCC, and
# writes sha256 checksums to installer\dist\SHA256SUMS.txt.
param(
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ScriptDir = $PSScriptRoot
$Stage = Join-Path $PSScriptRoot "..\_stage"
$StagePack = Join-Path $Stage "pack"
$Dist = Join-Path $PSScriptRoot "..\dist"
$PackDirs = @("agents", "skills", "commands", "rules", "hooks", "mcp-configs", "workflows", "plugins")

if (-not $Version) {
  $pkg = ($RepoRoot -replace "\\", "/") + "/package.json"
  $Version = (node -e "console.log(require(process.argv[1]).version)" $pkg).Trim()
}

if (Test-Path $Stage) { Remove-Item -LiteralPath $Stage -Recurse -Force }
New-Item -ItemType Directory -Path $StagePack -Force | Out-Null

$count = 0
foreach ($dir in $PackDirs) {
  $src = Join-Path $RepoRoot $dir
  if (-not (Test-Path $src)) { Write-Warning "Skipping missing pack dir: $dir"; continue }
  Copy-Item -LiteralPath $src -Destination $StagePack -Recurse -Force
  $count += (Get-ChildItem -LiteralPath $src -Recurse -File).Count
}
Get-ChildItem -LiteralPath $StagePack -Recurse -Force -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $StagePack -Recurse -Force -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Get-ChildItem -LiteralPath $StagePack -Recurse -Force -Directory -Filter ".git" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Write-Output "Staged $count pack files -> $StagePack"

$iscc = $env:ISCC
if (-not $iscc) {
  $candidates = @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe"
  )
  $iscc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $iscc) { throw "Inno Setup compiler (ISCC.exe) not found. Install Inno Setup 6 or set \$env:ISCC." }

New-Item -ItemType Directory -Path $Dist -Force | Out-Null
$iss = (Join-Path $ScriptDir "opencodemeva-patch.iss")

Push-Location $ScriptDir
try {
  & $iscc "/DAppVersion=$Version" $iss
  if ($LASTEXITCODE -ne 0) { throw "ISCC failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }

$exe = Join-Path $Dist "opencodemeva-patch-setup-$Version.exe"
if (-not (Test-Path $exe)) { throw "Expected output not found: $exe" }

$sums = Get-FileHash -LiteralPath $exe -Algorithm SHA256
$sumLine = "{0}  {1}" -f $sums.Hash, (Split-Path $exe -Leaf)
Set-Content -LiteralPath (Join-Path $Dist "SHA256SUMS.txt") -Value $sumLine -Encoding ascii
Write-Output "Built: $exe ($([math]::Round((Get-Item $exe).Length/1MB,2)) MB)"
Write-Output $sumLine