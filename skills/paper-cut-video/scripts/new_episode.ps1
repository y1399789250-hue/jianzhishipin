param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [string]$Destination = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$SkillRoot = Split-Path -Parent $PSScriptRoot
$Template = Join-Path $SkillRoot "assets\project-template"
$Episodes = Join-Path $Destination "episodes"
$Target = Join-Path $Episodes $Name

if (-not (Test-Path -LiteralPath $Template)) {
  throw "Template not found: $Template"
}

if (Test-Path -LiteralPath $Target) {
  throw "Episode already exists: $Target"
}

New-Item -ItemType Directory -Path $Episodes -Force | Out-Null
Copy-Item -LiteralPath $Template -Destination $Target -Recurse

Write-Host "Created episode: $Target"
Write-Host "Next:"
Write-Host "  cd $Target"
Write-Host "  npm install"
Write-Host "  npm run validate"
