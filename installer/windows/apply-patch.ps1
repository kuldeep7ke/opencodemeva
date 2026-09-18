# apply-patch.ps1 - syncs the OpenCode Meva patch pack into ~/.config/opencode.
#
#   Apply:   powershell -File apply-patch.ps1
#   Unapply: powershell -File apply-patch.ps1 -Unapply
#
# Default target is $env:USERPROFILE\.config\opencode. Override it in tests or
# unusual setups with -Target <dir> (or the OPENCODE_CONFIG_TARGET env var).
# Existing user files are never overwritten unless -Force is supplied.
param(
  [switch]$Unapply,
  [switch]$Quiet,
  [switch]$Force,
  [string]$Target = ""
)

$ErrorActionPreference = "Stop"

$Pack = if (Test-Path (Join-Path $PSScriptRoot "pack")) { Join-Path $PSScriptRoot "pack" } else { Join-Path $PSScriptRoot "." }
$Dirs = @("agents", "skills", "commands", "rules", "hooks", "mcp-configs", "workflows", "plugins")
$Version = "2.2.1"
$MarkerName = ".opencodemeva.json"

function Get-Dest {
  if ($Target) { return $Target }
  if ($env:OPENCODE_CONFIG_TARGET) { return $env:OPENCODE_CONFIG_TARGET }
  return (Join-Path $env:USERPROFILE ".config\opencode")
}

function Get-Hash([string]$path) {
  try { return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash }
  catch { return "" }
}

function Log($msg) { if (-not $Quiet) { Write-Host $msg } }

$Dest = (Get-Dest)
$Marker = Join-Path $Dest $MarkerName

if ($Unapply) {
  if (Test-Path $Marker) {
    $state = Get-Content $Marker -Raw | ConvertFrom-Json
    $removed = 0; $kept = 0
    foreach ($rel in $state.files.PSObject.Properties.Name) {
      $full = Join-Path $Dest ($rel -replace "/", "\")
      if (Test-Path $full) {
        $expected = $state.files.$rel.srcHash
        if ($Force -or ((Get-Hash $full) -eq $expected)) {
          Remove-Item -LiteralPath $full -Force -ErrorAction SilentlyContinue
          $removed++
        } else { $kept++ }
      }
    }
    Remove-Item -LiteralPath $Marker -Force -ErrorAction SilentlyContinue
    Log "OpenCode Meva Patch: removed $removed files (kept $kept that were modified)."
    if ($kept -gt 0) { Log ("Left modified files in place at: " + $Dest) }
  } else {
    Log "No patch marker found at $Marker - nothing to undo."
  }
  exit 0
}

if (-not (Test-Path $Pack)) { throw "Patch pack not found at $Pack" }

New-Item -ItemType Directory -Path $Dest -Force | Out-Null

$files = @{}
$applied = 0; $skipped = 0
foreach ($dir in $Dirs) {
  $srcDir = Join-Path $Pack $dir
  if (-not (Test-Path $srcDir)) { continue }
  $srcRoot = (Resolve-Path $srcDir).Path
  $relRoot = (Split-Path $srcRoot -Leaf)
  Get-ChildItem -LiteralPath $srcRoot -Recurse -File | ForEach-Object {
    $rel = Join-Path $relRoot ($_.FullName.Substring($srcRoot.Length).TrimStart("\"))
    $relKey = $rel -replace "\\", "/"
    $destFile = Join-Path $Dest $rel
    if (Test-Path $destFile) {
      if (-not $Force) {
        $files[$relKey] = @{ srcHash = (Get-Hash $_.FullName); present = $true }
        $skipped++
        return
      }
    }
    New-Item -ItemType Directory -Path (Split-Path $destFile -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destFile -Force
    $files[$relKey] = @{ srcHash = (Get-Hash $_.FullName); present = $true }
    $applied++
  }
}

$state = [ordered]@{
  version = $Version
  appliedAt = (Get-Date).ToUniversalTime().ToString("o")
  source = $Pack
  dirs = $Dirs
  files = $files
}
$state | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $Marker -Encoding utf8

Log "OpenCode Meva Patch $Version applied to $Dest"
Log "  $applied files installed, $skipped already present (kept yours)."
if (-not $Quiet) {
  Log ""
  Log "Next step: restart your terminal, close and reopen opencode if it's running,"
  Log "then ask opencode for @planner, @code-reviewer, @security-reviewer or load a skill."
}