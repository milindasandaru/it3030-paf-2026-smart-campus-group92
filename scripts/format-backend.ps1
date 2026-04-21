Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location "$PSScriptRoot\..\backend"
try {
    mvn spotless:apply
} finally {
    Pop-Location
}
