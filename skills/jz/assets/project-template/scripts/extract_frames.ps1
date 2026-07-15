param(
  [string]$Input = "out/final.mp4",
  [string[]]$Times = @("2", "5", "8"),
  [string]$OutputDir = "out/check-frames"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Input)) {
  throw "Video not found: $Input"
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

foreach ($Time in $Times) {
  $SafeTime = $Time -replace "[:\.]", "-"
  $Output = Join-Path $OutputDir "check-$SafeTime.png"
  ffmpeg -y -ss $Time -i $Input -frames:v 1 $Output
  Write-Host "wrote $Output"
}
