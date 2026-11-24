# ClassPilot Backend Startup Script
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\backend"

# Check if PostgreSQL 18 is running on port 5433
$pgReady = & "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h 127.0.0.1 -p 5433 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[1/2] Starting ClassPilot PostgreSQL cluster on port 5433..." -ForegroundColor Cyan
    & "$scriptDir\start-db.ps1"
} else {
    Write-Host "[1/2] PostgreSQL cluster on port 5433 is active." -ForegroundColor Green
}

# Start FastAPI server using project virtual environment
Write-Host "[2/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
