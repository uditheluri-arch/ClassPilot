# ClassPilot Frontend Startup Script
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"

Write-Host "Starting ClassPilot React Frontend on http://localhost:5173..." -ForegroundColor Green
npm run dev
