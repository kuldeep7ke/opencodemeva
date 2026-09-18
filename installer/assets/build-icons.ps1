# Builds app icon assets for the installer from the repo logo.
#   - appicon.ico   (16, 24, 32, 48, 64, 128, 256 — BMP frames + PNG 256)
#   - appicon-256.png / appicon-512.png
#   - appicon.svg   (passthrough copy of assets/ecc-icon.svg)
param(
  [string]$InputPng = "installer/../assets/images/ecc-logo.png",
  [string]$OutDir = "installer/assets"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$inputPath = (Resolve-Path $InputPng).Path
$source = [System.Drawing.Bitmap]::FromFile($inputPath)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

function Render-Sized([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($source, 0, 0, $size, $size)
  $g.Dispose()
  return $bmp
}

function Get-Bgra([System.Drawing.Bitmap]$bmp) {
  $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  $bmp.UnlockBits($data)
  return , $bytes
}

function Get-Png([System.Drawing.Bitmap]$bmp) {
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $arr = $ms.ToArray()
  $ms.Dispose()
  return , $arr
}

function New-Ico([int[]]$sizes) {
  $ms = New-Object System.IO.MemoryStream
  $bw = New-Object System.IO.BinaryWriter($ms)
  $bw.Write([uint16]0)
  $bw.Write([uint16]1)
  $bw.Write([uint16]$sizes.Count)

  $entries = @()
  foreach ($s in $sizes) {
    $bmp = Render-Sized $s
    if ($s -ge 256) { $payload = Get-Png $bmp; $isPng = $true }
    else {
      $bgra = Get-Bgra $bmp
      $andStride = [int]([Math]::Ceiling($s / 8.0))
      $andStridePadded = [int](([Math]::Ceiling($andStride / 4.0)) * 4)
      $ms2 = New-Object System.IO.MemoryStream
      $bw2 = New-Object System.IO.BinaryWriter($ms2)
      $bw2.Write([uint32]40)
      $bw2.Write([int32]$s)
      $bw2.Write([int32]($s * 2))
      $bw2.Write([uint16]1)
      $bw2.Write([uint16]32)
      $bw2.Write([uint32]0)
      $bw2.Write([uint32]($s * $s * 4))
      $bw2.Write([int32]0)
      $bw2.Write([int32]0)
      $bw2.Write([uint32]0)
      $bw2.Write([uint32]0)
      for ($row = $s - 1; $row -ge 0; $row--) {
        $bw2.Write($bgra, $row * $s * 4, $s * 4)
      }
      for ($row = 0; $row -lt $s; $row++) { $bw2.Write([byte[]](New-Object byte[] $andStridePadded), 0, $andStridePadded) }
      $payload = $ms2.ToArray()
      $isPng = $false
      $bw2.Dispose(); $ms2.Dispose()
    }
    $bmp.Dispose()
    $entries += [pscustomobject]@{ Size = $s; IsPng = $isPng; Payload = $payload }
  }

  $offset = 6 + (16 * $sizes.Count)
  foreach ($e in $entries) {
    $dim = if ($e.Size -ge 256) { 0 } else { $e.Size }
    $bw.Write([byte]$dim)
    $bw.Write([byte]$dim)
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    if ($e.IsPng) { $bw.Write([uint16]1); $bw.Write([uint16]32) }
    else { $bw.Write([uint16]1); $bw.Write([uint16]32) }
    $bw.Write([uint32]$e.Payload.Length)
    $bw.Write([uint32]$offset)
    $offset += $e.Payload.Length
  }
  foreach ($e in $entries) { $bw.Write($e.Payload) }

  $bw.Flush()
  $data = $ms.ToArray()
  $bw.Dispose(); $ms.Dispose()
  return , $data
}

$icoBytes = New-Ico @(16, 24, 32, 48, 64, 128, 256)
[System.IO.File]::WriteAllBytes((Join-Path $OutDir "appicon.ico"), $icoBytes)

foreach ($s in @(256, 512)) {
  $bmp = Render-Sized $s
  $bmp.Save((Join-Path $OutDir "appicon-$s.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$source.Dispose()

if (Test-Path "assets/ecc-icon.svg") {
  Copy-Item "assets/ecc-icon.svg" (Join-Path $OutDir "appicon.svg") -Force
}

$ico = Get-Item (Join-Path $OutDir "appicon.ico")
$p256 = Get-Item (Join-Path $OutDir "appicon-256.png")
$p512 = Get-Item (Join-Path $OutDir "appicon-512.png")
Write-Output ("appicon.ico      {0,8:N0} bytes" -f $ico.Length)
Write-Output ("appicon-256.png  {0,8:N0} bytes" -f $p256.Length)
Write-Output ("appicon-512.png  {0,8:N0} bytes" -f $p512.Length)
Write-Output "OK"