Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

& "$PSScriptRoot\format-backend.ps1"
& "$PSScriptRoot\format-frontend.ps1"
Write-Host "Backend and frontend formatting complete."
