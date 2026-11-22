# Install a per-user Windows task for the production backend.
# No Tailscale machine identity or IP address is accessed or logged.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot 'run-production.ps1'
$taskName = 'VocabMaster-Production-API'

if (!(Test-Path (Join-Path $root 'dist\main.js'))) {
    throw 'Production build not found. Run npm run build from the backend directory first.'
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -WorkingDirectory $root -Argument (
    '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '"'
)
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
    -RestartCount 10 -RestartInterval (New-TimeSpan -Minutes 1) `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew -StartWhenAvailable

# Run as the current Windows user with limited permissions, never as SYSTEM.
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Force -ErrorAction Stop | Out-Null
Start-ScheduledTask -TaskName $taskName -ErrorAction Stop

Write-Output 'BACKEND_TASK_INSTALLED=True'
Write-Output 'BACKEND_TASK_STARTED=True'
