# Install a per-user Windows task for the production backend.
# The task starts the watchdog at logon AND re-checks every 2 minutes, so the
# API comes back after a reboot, sleep/resume, or if the watchdog ever dies.
# It launches through wscript (run-hidden.vbs) so NO terminal window ever shows.
# The watchdog holds a global mutex, so extra launches exit immediately.
# No machine identifiers, IP addresses or device fingerprints are read or logged.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $PSScriptRoot 'run-hidden.vbs'
$taskName = 'VocabMaster-Production-API'

if (!(Test-Path (Join-Path $root 'dist\main.js'))) {
    throw 'Production build not found. Run npm run build from the backend directory first.'
}

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -WorkingDirectory $root `
    -Argument ('//B //Nologo "' + $launcher + '"')

$logon = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$repeat = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Minutes 2) -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
    -RestartCount 10 -RestartInterval (New-TimeSpan -Minutes 1) `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew -StartWhenAvailable -Hidden

# Current Windows user, limited rights, never SYSTEM, no password stored.
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($logon, $repeat) `
    -Settings $settings -Principal $principal -Force -ErrorAction Stop | Out-Null

# Also make the per-user autostart entry window-less.
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$cmd = 'wscript.exe //B //Nologo "' + $launcher + '"'
New-ItemProperty -Path $runKey -Name 'VocabMasterProductionAPI' -Value $cmd -PropertyType String -Force | Out-Null

Start-ScheduledTask -TaskName $taskName -ErrorAction Stop

Write-Output 'BACKEND_TASK_INSTALLED=True'
Write-Output 'BACKEND_TASK_STARTED=True'
