# Install a non-administrator, current-user startup watchdog for the API.
# Does not read machine names, machine IPs, or any other device identifiers.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot 'run-production.ps1'

if (-not (Test-Path (Join-Path $root 'dist\main.js'))) {
    throw 'Build the production API first: npm run build'
}

$startupKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$command = 'powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '"'
New-ItemProperty -Path $startupKey -Name 'VocabMasterProductionAPI' -Value $command -PropertyType String -Force -ErrorAction Stop | Out-Null
Write-Output 'AUTO_START_SAVED=True'

# Start immediately too, without requiring npm run dev to remain open.
$arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '"'
Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -WindowStyle Hidden -ErrorAction Stop
Write-Output 'WATCHDOG_LAUNCHED=True'
