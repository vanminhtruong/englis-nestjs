# Automatic source-to-production rebuild watchdog.
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
$lastGood = if (Test-Path $stateFile) { (Get-Content $stateFile -Raw).Trim() } else { '' }
$lastAttempted = $lastGood
$node = (Get-Command node -ErrorAction Stop).Source
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
    foreach ($name in @('tsconfig.json', 'tsconfig.build.json', 'nest-cli.json', 'package.json', 'package-lock.json')) {
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
function Start-Backend {
    if (Test-BackendPort) { return $null }
    if (-not (Test-Path (Join-Path $dist 'main.js'))) { return $null }
    return Start-Process -FilePath $node -ArgumentList @((Join-Path $dist 'main.js')) -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput $nodeOutput -RedirectStandardError $nodeError
}
function Wait-Ready([int]$seconds) {
    for ($i = 0; $i -lt $seconds; $i++) {
        if (Test-BackendReady) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}
function Stop-BackendChild {
    if ($script:backend -and -not $script:backend.HasExited) {
        Stop-Process -Id $script:backend.Id -Force -ErrorAction SilentlyContinue
        try { $script:backend.WaitForExit(5000) | Out-Null } catch {}
    }
    $script:backend = $null
}
function Compile-Candidate {
    if (-not (Test-Path $compiler)) { Log-State 'build-failed: missing TypeScript compiler'; return $false }
    if (Test-Path $candidate) { Remove-Item $candidate -Recurse -Force -ErrorAction Stop }
    Log-State 'building'
    & $node $compiler -p (Join-Path $root 'tsconfig.build.json') --outDir $candidate --rootDir (Join-Path $root 'src') --incremental false *> $buildLog
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path (Join-Path $candidate 'main.js'))) {
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
    Log-State 'deploying'
    if (Test-Path $previous) { Remove-Item $previous -Recurse -Force -ErrorAction Stop }
    try {
        if (Test-Path $dist) { [IO.Directory]::Move($dist, $previous) }
        [IO.Directory]::Move($candidate, $dist)
    } catch {
        if ((Test-Path $previous) -and -not (Test-Path $dist)) { [IO.Directory]::Move($previous, $dist) }
        Log-State 'deploy-failed: previous build preserved'
        return $false
    }
    Stop-BackendChild
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
if (-not $mutex.WaitOne(0)) { return }
try {
    if (-not (Test-Path (Join-Path $dist 'main.js')) -and (Test-Path (Join-Path $previous 'main.js'))) {
        if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
        [IO.Directory]::Move($previous, $dist)
    }
    if (-not (Test-BackendPort)) {
        $backend = Start-Backend
        if (Wait-Ready 25) { Log-State 'ready: checking source' }
    }
    $pending = ''
    $pendingSince = [DateTime]::MinValue
    while ($true) {
        Set-Content -LiteralPath (Join-Path $logs 'watchdog.status') -Value 'running' -Encoding Ascii
        try {
            $fingerprint = Get-SourceFingerprint
            if ($fingerprint -ne $lastAttempted) {
                if ($fingerprint -ne $pending) {
                    $pending = $fingerprint
                    $pendingSince = [DateTime]::UtcNow
                } elseif (([DateTime]::UtcNow - $pendingSince).TotalSeconds -ge 3) {
                    $lastAttempted = $fingerprint
                    if (Compile-Candidate) {
                        if (Deploy-Candidate $fingerprint) { $lastGood = $fingerprint }
                    }
                    $pending = ''
                }
            } else { $pending = '' }
            if ($backend -and $backend.HasExited) { $backend = $null }
            if (-not $backend -and -not (Test-BackendPort)) {
                $backend = Start-Backend
                if (Wait-Ready 25) { Log-State 'ready: backend recovered' }
            }
        } catch { Log-State 'watchdog-error: retry after next source change' }
        Start-Sleep -Seconds 3
    }
} finally {
    $mutex.ReleaseMutex()
    $mutex.Dispose()
}
