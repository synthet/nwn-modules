# Run NWScript mock unit tests using Python.
# Requires: python3 (3.8+)
# Usage: .\scripts\run-script-tests.ps1

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..")
$TestsDir  = Join-Path $RepoRoot "tools\testing\script-tests"

# Check for python3 (try python3 then python)
$PythonCmd = $null
foreach ($Candidate in @("python3", "python")) {
    if (Get-Command $Candidate -ErrorAction SilentlyContinue) {
        # Verify it's Python 3
        $VerCheck = & $Candidate -c "import sys; print(sys.version_info.major)" 2>$null
        if ($VerCheck -eq "3") {
            $PythonCmd = $Candidate
            break
        }
    }
}

if (-not $PythonCmd) {
    Write-Error @"
ERROR: python3 not found on PATH.

Install instructions:
  Windows: https://python.org/downloads
  Ensure 'Add Python to PATH' is checked during installation.
"@
    exit 1
}

$PythonVersion = & $PythonCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
Write-Host "Python version: $PythonVersion"

if (-not (Test-Path $TestsDir)) {
    Write-Error "ERROR: Test directory not found: $TestsDir"
    exit 1
}

Push-Location $RepoRoot
try {
    # Try pytest first, fall back to unittest
    $PytestCheck = & $PythonCmd -m pytest --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Test runner: pytest"
        Write-Host ""
        & $PythonCmd -m pytest $TestsDir -v
        $ExitCode = $LASTEXITCODE
    } else {
        Write-Host "pytest not found. Falling back to unittest."
        Write-Host "  (Install pytest for better output: pip install pytest)"
        Write-Host ""
        & $PythonCmd -m unittest discover $TestsDir -v
        $ExitCode = $LASTEXITCODE
    }
} finally {
    Pop-Location
}

exit $ExitCode
