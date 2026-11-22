# Production watchdog for the NestJS API.
# Runs under the current Windows user via Task Scheduler; never run as SYSTEM.
# Keeps the production API alive even after closing npm run dev terminals.

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$env:NODE_ENV = 'production'
if (-not $env:PORT) { $env:PORT = '3000' }

$logDir = Join-Path $root 'logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logPath = Join-Path $logDir 'backend-production.log'

function Test-BackendPort([int]$port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $result = $client.BeginConnect('127.0.0.1', $port, $null, $null)
        $connected = $result.AsyncWaitHandle.WaitOne(700)
        if ($connected) {
            $client.EndConnect($result)
            return $true
        }
        return $false
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

# Prevent duplicate watchdogs if Windows starts this script twice.
$mutex = New-Object System.Threading.Mutex($false, 'Local\VocabMasterProductionAPI')
if (-not $mutex.WaitOne(0)) { return }

try {
while ($true) {
    # A heartbeat confirms the watchdog is alive without logging device data.
    Set-Content -LiteralPath (Join-Path $logDir 'watchdog.status') -Value 'running' -Encoding Ascii
    # If npm run dev already owns the port, wait. When the terminal closes,
    # the task automatically takes over with the compiled production server.
    if (Test-BackendPort ([int]$env:PORT)) {
        Start-Sleep -Seconds 5
        continue
    }

    if (-not (Test-Path -LiteralPath (Join-Path $root 'dist\main.js'))) {
        Start-Sleep -Seconds 10
        continue
    }

    try {
        if ((Test-Path $logPath) -and (Get-Item $logPath).Length -gt 10MB) {
            Move-Item -LiteralPath $logPath -Destination (Join-Path $logDir 'backend-production.previous.log') -Force
        }
        # Keeping the child in this long-lived task enables restart on crash.
        & node (Join-Path $root 'dist\main.js') *>> $logPath
    } catch {
        # Don't log environment values or secrets.
    }

    Start-Sleep -Seconds 5
}
} finally {
    $mutex.ReleaseMutex()
    $mutex.Dispose()
}
