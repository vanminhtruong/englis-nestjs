# Event-driven source-to-production rebuild watchdog.
param([int]$AdoptBackendPid = 0)
# Runs under the existing hidden per-user task and leaves Tailscale untouched.
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$env:NODE_ENV = 'production'
if (-not $env:PORT) {
    $file = Join-Path $root '.env'
    if (Test-Path $file) {
        foreach ($line in (Get-Content $file)) {
            if ($line -match '^\s*PORT\s*=\s*(\d+)\s*$') { $env:PORT = $Matches[1]; break }
        }
    }
}
if (-not $env:PORT) { $env:PORT = '3001' }
$port = [int]$env:PORT
$logs = Join-Path $root 'logs'
$work = Join-Path $root '.live-build'
New-Item -ItemType Directory -Path $logs, $work -Force | Out-Null
$stateFile = Join-Path $logs 'production-build.fingerprint'
$deployStatus = Join-Path $logs 'production-deploy.status'
$nodeOutput = Join-Path $logs 'backend-production.log'
$nodeError = Join-Path $logs 'backend-production-error.log'
$buildLog = Join-Path $logs 'backend-build.log'
$ownerFile = Join-Path $logs 'production-backend.pid.json'
$lastGood = if (Test-Path $stateFile) { (Get-Content $stateFile -Raw).Trim() } else { '' }
$lastAttempted = $lastGood
$retryAt = [DateTime]::MinValue
$retryDelay = 3
$node = (Get-Command node -ErrorAction Stop).Source
$silentLauncher = Join-Path $PSScriptRoot 'run-node-silent.cjs'
$compiler = Join-Path $root 'node_modules\typescript\bin\tsc'
$dist = Join-Path $root 'dist'
$candidate = Join-Path $work 'candidate'
$previous = Join-Path $work 'previous'
$backend = $null

function Log-State([string]$status) {
    Set-Content -LiteralPath $deployStatus -Value $status -Encoding Ascii
}
function Test-BackendPort {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $ar = $tcp.BeginConnect('127.0.0.1', $port, $null, $null)
        if (-not $ar.AsyncWaitHandle.WaitOne(700)) { return $false }
        $tcp.EndConnect($ar)
        return $true
    } catch { return $false } finally { $tcp.Close() }
}
function Test-BackendReady {
    try {
        $request = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$port/srs/overview")
        $request.Timeout = 1200
        $request.Method = 'GET'
        $response = $request.GetResponse()
        $code = [int]$response.StatusCode
        $response.Close()
        return $code -eq 200
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            $_.Exception.Response.Close()
            return $code -eq 401
        }
        return $false
    } catch { return $false }
}
function Get-SourceFingerprint {
    $files = @(Get-ChildItem -LiteralPath (Join-Path $root 'src') -Recurse -File -Filter '*.ts' -ErrorAction Stop)
    foreach ($name in @('tsconfig.json', 'tsconfig.build.json', 'nest-cli.json', 'package.json', 'package-lock.json', '.env')) {
        $file = Join-Path $root $name
        if (Test-Path $file) { $files += Get-Item $file }
    }
    $signature = $files | Sort-Object FullName | ForEach-Object {
        $_.FullName.Substring($root.Length) + ':' + $_.Length + ':' + $_.LastWriteTimeUtc.Ticks
    }
    $bytes = [Text.Encoding]::UTF8.GetBytes(($signature -join '|'))
    $digest = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($digest.ComputeHash($bytes)).Replace('-', '') }
    finally { $digest.Dispose() }
}
function Save-BackendOwner($process) {
    if (-not $process) { return }
    try {
        $record = @{ pid = $process.Id; started = $process.StartTime.ToUniversalTime().Ticks.ToString() }
        $record | ConvertTo-Json -Compress | Set-Content -LiteralPath $ownerFile -Encoding Ascii
    } catch {}
}
function Restore-BackendOwner([int]$explicitPid = 0) {
    try {
        $record = $null
        if ($explicitPid -le 0) {
            if (-not (Test-Path $ownerFile)) { return $null }
            $record = Get-Content $ownerFile -Raw | ConvertFrom-Json
            $explicitPid = [int]$record.pid
        }
        if ($explicitPid -le 0) { return $null }
        $proc = Get-CimInstance Win32_Process -Filter "Name='node.exe' AND ProcessId=$explicitPid" -ErrorAction SilentlyContinue
        $expected = Join-Path $dist 'main.js'
        if (-not $proc -or -not $proc.CommandLine -or -not $proc.CommandLine.Contains($expected)) { return $null }
        $process = Get-Process -Id $explicitPid -ErrorAction Stop
        if ($record -and $process.StartTime.ToUniversalTime().Ticks.ToString() -ne $record.started) { return $null }
        Save-BackendOwner $process
        return $process
    } catch { return $null }
}
function New-SilentNodeInfo([string[]]$nodeArgs) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $node
    $info.WorkingDirectory = $root
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $allArgs = @($silentLauncher) + $nodeArgs
    $info.Arguments = (($allArgs | ForEach-Object {
        if ($_ -match '["\r\n]') { throw 'Invalid silent process argument' }
        '"' + $_ + '"'
    }) -join ' ')
    return $info
}
function Invoke-SilentNode([string[]]$nodeArgs) {
    $info = New-SilentNodeInfo $nodeArgs
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::Start($info)
    try {
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return @{ Code = $process.ExitCode; Output = $stdout.GetAwaiter().GetResult().Trim(); Error = $stderr.GetAwaiter().GetResult().Trim() }
    } finally { $process.Dispose() }
}
function Start-Backend {
    if (Test-BackendPort) { return $null }
    if (-not (Test-Path (Join-Path $dist 'main.js'))) { return $null }
    $info = New-SilentNodeInfo @('backend', $nodeOutput, $nodeError, (Join-Path $dist 'main.js'))
    $process = [System.Diagnostics.Process]::Start($info)
    Save-BackendOwner $process
    return $process
}
function Wait-Ready([int]$seconds) {
    $deadline = [DateTime]::UtcNow.AddSeconds($seconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        if (Test-BackendReady) { return $true }
        Start-Sleep -Milliseconds 250
    }
    return $false
}
function Stop-BackendChild {
    if ($script:backend -and -not $script:backend.HasExited) {
        Stop-Process -Id $script:backend.Id -Force -ErrorAction SilentlyContinue
        try { $script:backend.WaitForExit(5000) | Out-Null } catch {}
    }
    $script:backend = $null
    Remove-Item -LiteralPath $ownerFile -Force -ErrorAction SilentlyContinue
}
function Compile-Candidate {
    if (-not (Test-Path $compiler)) { Log-State 'build-failed: missing TypeScript compiler'; return $false }
    if (Test-Path $candidate) { Remove-Item $candidate -Recurse -Force -ErrorAction Stop }
    Log-State 'building'
    $result = Invoke-SilentNode @('build', $buildLog, $buildLog, $compiler, '-p', (Join-Path $root 'tsconfig.build.json'), '--outDir', $candidate, '--rootDir', (Join-Path $root 'src'), '--incremental', 'false', '--declaration', 'false', '--sourceMap', 'false', '--noEmitOnError', 'true')
    if ($result.Error) { Add-Content -LiteralPath $buildLog -Value $result.Error -Encoding UTF8 }
    if ($result.Code -ne 0 -or -not (Test-Path (Join-Path $candidate 'main.js'))) {
        Log-State 'build-failed: previous production backend preserved'
        return $false
    }
    return $true
}
function Deploy-Candidate([string]$fingerprint) {
    if (-not $script:backend -and (Test-BackendPort)) {
        Log-State 'waiting: a different process owns backend port'
        return $false
    }
    if ((Get-SourceFingerprint) -ne $fingerprint) {
        Log-State 'source changed during build: rebuilding'
        return $false
    }
    Log-State 'deploying'
    if (Test-Path $previous) { Remove-Item $previous -Recurse -Force -ErrorAction Stop }
    Stop-BackendChild
    try {
        if (Test-Path $dist) { [IO.Directory]::Move($dist, $previous) }
        [IO.Directory]::Move($candidate, $dist)
    } catch {
        if ((Test-Path $previous) -and -not (Test-Path $dist)) { [IO.Directory]::Move($previous, $dist) }
        $script:backend = Start-Backend
        Log-State 'deploy-failed: previous build preserved'
        return $false
    }
    $script:backend = Start-Backend
    if (Wait-Ready 25) {
        Set-Content -LiteralPath $stateFile -Value $fingerprint -Encoding Ascii
        if (Test-Path $previous) { Remove-Item $previous -Recurse -Force -ErrorAction SilentlyContinue }
        Log-State 'ready: latest source deployed'
        return $true
    }
    Stop-BackendChild
    try {
        if (Test-Path $dist) { Remove-Item $dist -Recurse -Force -ErrorAction Stop }
        if (Test-Path $previous) { [IO.Directory]::Move($previous, $dist) }
        $script:backend = Start-Backend
        if (Wait-Ready 25) { Log-State 'rollback: previous backend restored' }
        else { Log-State 'rollback: previous backend unavailable' }
    } catch { Log-State 'rollback-failed: manual recovery needed' }
    return $false
}
$mutex = New-Object System.Threading.Mutex($false, 'Global\VocabMasterProductionAPI')
$ownsMutex = $false
$watchers = @()
$eventIds = @()
try {
    try { $ownsMutex = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $ownsMutex = $true }
    if (-not $ownsMutex) { return }
    $backend = Restore-BackendOwner $AdoptBackendPid
    if (-not (Test-Path (Join-Path $dist 'main.js')) -and (Test-Path (Join-Path $previous 'main.js'))) {
        if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
        [IO.Directory]::Move($previous, $dist)
    }
    foreach ($path in @((Join-Path $root 'src'), $root)) {
        $w = New-Object IO.FileSystemWatcher
        $w.Path = $path
        $w.IncludeSubdirectories = ($path -ne $root)
        $w.Filter = '*'
        $w.NotifyFilter = [IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
        $w.InternalBufferSize = 32768
        $watchers += $w
        foreach ($kind in @('Changed','Created','Deleted','Renamed','Error')) {
            $id = 'VocabMaster.' + $watchers.Count + '.' + $kind
            Register-ObjectEvent -InputObject $w -EventName $kind -SourceIdentifier $id | Out-Null
            $eventIds += $id
        }
        $w.EnableRaisingEvents = $true
    }
    if (-not (Test-BackendPort)) {
        $backend = Start-Backend
        if (Wait-Ready 25) { Log-State 'ready: checking source' }
    }
    $pending = ''
    $pendingSince = [DateTime]::MinValue
    $nextScan = [DateTime]::MinValue
    $nextHeartbeat = [DateTime]::MinValue
    $nextRecovery = [DateTime]::MinValue
    while ($true) {
        try {
            $now = [DateTime]::UtcNow
            if ($now -ge $nextHeartbeat) {
                Set-Content -LiteralPath (Join-Path $logs 'watchdog.status') -Value 'running: realtime' -Encoding Ascii
                $nextHeartbeat = $now.AddSeconds(5)
            }
            $dirty = $false
            foreach ($id in $eventIds) {
                foreach ($evt in @(Get-Event -SourceIdentifier $id -ErrorAction SilentlyContinue)) {
                    $name = $evt.SourceEventArgs.Name
                    $oldName = $evt.SourceEventArgs.OldName
                    if ($id.EndsWith('.Error') -or $id.StartsWith('VocabMaster.1.') -or
                        $name -in @('tsconfig.json','tsconfig.build.json','nest-cli.json','package.json','package-lock.json','.env') -or
                        $oldName -in @('tsconfig.json','tsconfig.build.json','nest-cli.json','package.json','package-lock.json','.env')) {
                        $dirty = $true
                    }
                    Remove-Event -EventIdentifier $evt.EventIdentifier -ErrorAction SilentlyContinue
                }
            }
            if ($dirty -or $now -ge $nextScan -or $pending) {
                $fingerprint = Get-SourceFingerprint
                $nextScan = $now.AddSeconds(2)
                if ($fingerprint -eq $lastGood) {
                    $pending = ''
                    $retryAt = [DateTime]::MinValue
                    $retryDelay = 3
                } elseif ($fingerprint -ne $pending) {
                    $pending = $fingerprint
                    $pendingSince = $now
                    if ($fingerprint -ne $lastAttempted) { $retryAt = [DateTime]::MinValue; $retryDelay = 3 }
                    Log-State 'pending: source change detected'
                }
                if ($pending -and ($now - $pendingSince).TotalMilliseconds -ge 450 -and $now -ge $retryAt) {
                    $lastAttempted = $pending
                    if ((Compile-Candidate) -and (Deploy-Candidate $pending)) {
                        $lastGood = $pending
                        $pending = ''
                        $retryDelay = 3
                        $retryAt = [DateTime]::MinValue
                    } else {
                        $retryAt = [DateTime]::UtcNow.AddSeconds($retryDelay)
                        $retryDelay = [Math]::Min(30, $retryDelay * 2)
                    }
                    $nextScan = [DateTime]::MinValue
                }
            }
            if ($backend -and $backend.HasExited) { $backend = $null }
            if ([DateTime]::UtcNow -ge $nextRecovery -and -not $backend -and -not (Test-BackendPort)) {
                $nextRecovery = [DateTime]::UtcNow.AddSeconds(3)
                $backend = Start-Backend
                if ((Wait-Ready 25) -and -not $pending) { Log-State 'ready: backend recovered' }
            }
        } catch {
            Log-State 'watchdog-error: automatic retry scheduled'
            $retryAt = [DateTime]::UtcNow.AddSeconds(3)
            $nextScan = [DateTime]::MinValue
        }
        Wait-Event -Timeout 1 | Out-Null
    }
} finally {
    foreach ($id in $eventIds) {
        Unregister-Event -SourceIdentifier $id -ErrorAction SilentlyContinue
        Get-Event -SourceIdentifier $id -ErrorAction SilentlyContinue | Remove-Event -ErrorAction SilentlyContinue
    }
    foreach ($w in $watchers) { $w.Dispose() }
    if ($ownsMutex) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
  486
  314
