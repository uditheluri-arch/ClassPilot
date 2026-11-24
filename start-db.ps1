# ClassPilot Dedicated PostgreSQL 18 Startup Script
# Safe, idempotent, non-destructive launcher for ClassPilot database cluster on port 5433.

$ErrorActionPreference = "Continue"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pgDataDir = Join-Path $rootDir "backend\pgdata"
$pgExe = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
$pgIsReady = "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
$port = 5433
$hostAddr = "127.0.0.1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ClassPilot - PostgreSQL 18 Cluster Manager (Port 5433)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify PostgreSQL installation
if (-not (Test-Path $pgExe)) {
    Write-Error "PostgreSQL 18 binary not found at: $pgExe"
    exit 1
}

# 2. Verify pgdata directory integrity
if (-not (Test-Path (Join-Path $pgDataDir "PG_VERSION"))) {
    Write-Error "Data directory invalid or missing PG_VERSION: $pgDataDir"
    exit 1
}

# 3. Check if already listening on port 5433
$isListening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($isListening) {
    $procId = $isListening[0].OwningProcess
    Write-Host "[ALREADY RUNNING] PostgreSQL is already active on $hostAddr`:$port (PID: $procId)" -ForegroundColor Green
    Write-Host "Database: classpilot_db" -ForegroundColor Gray
    Write-Host "Username: postgres" -ForegroundColor Gray
    exit 0
}

# 4. Check for stale postmaster.pid
$pidFile = Join-Path $pgDataDir "postmaster.pid"
if (Test-Path $pidFile) {
    try {
        $stalePid = (Get-Content $pidFile -TotalCount 1).Trim()
        $proc = Get-Process -Id $stalePid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "[WARNING] Process $stalePid is active and owns the data directory." -ForegroundColor Yellow
        } else {
            Write-Host "[INFO] Detected postmaster.pid from terminated session (PID $stalePid). Recovery will run automatically." -ForegroundColor Gray
        }
    } catch {
        # Proceed with standard startup
    }
}

# 5. Start PostgreSQL process cleanly
Write-Host "[STARTING] Launching PostgreSQL 18 on $hostAddr`:$port..." -ForegroundColor Yellow
$argList = "-D `"$pgDataDir`" -p $port -h $hostAddr"

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $pgExe
$startInfo.Arguments = $argList
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($startInfo)

# 6. Wait for database to accept connections
$ready = $false
for ($i = 1; $i -le 10; $i++) {
    Start-Sleep -Seconds 1
    & $pgIsReady -h $hostAddr -p $port -q 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }
}

if ($ready) {
    Write-Host "[SUCCESS] ClassPilot PostgreSQL cluster is online and ready!" -ForegroundColor Green
    Write-Host "  - Host:      $hostAddr" -ForegroundColor White
    Write-Host "  - Port:      $port" -ForegroundColor White
    Write-Host "  - Database:  classpilot_db" -ForegroundColor White
    Write-Host "  - User:      postgres" -ForegroundColor White
    Write-Host "  - PID:       $($process.Id)" -ForegroundColor White
} else {
    Write-Host "[FAILED] PostgreSQL did not become ready within 10 seconds." -ForegroundColor Red
    Write-Host "Check backend\pgdata\logfile.txt for details." -ForegroundColor Yellow
    exit 1
}
