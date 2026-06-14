# Build the module using Nasher.
# Requires: nasher on PATH
# Usage: .\scripts\build-module.ps1 [-Target module|art|tlk|all]

[CmdletBinding()]
param(
    [ValidateSet("module", "art", "tlk", "all")]
    [string]$Target = "module"
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..")

# Check for nasher
if (-not (Get-Command "nasher" -ErrorAction SilentlyContinue)) {
    Write-Error @"
ERROR: nasher not found on PATH.

Install instructions:
  Nasher requires Nim. Install from: https://nim-lang.org
  Then: nimble install nasher

  Or see docs/design/toolchain.md for the pinned version.
"@
    exit 1
}

$NasherVersion = & nasher --version 2>&1
Write-Host "Nasher: $NasherVersion"
Write-Host "Target: $Target"
Write-Host "Repo:   $RepoRoot"
Write-Host ""

Push-Location $RepoRoot
try {
    $BuildFailed = $false

    function Invoke-BuildTarget {
        param([string]$T)
        Write-Host "--- Building target: $T ---"
        $Output = & nasher pack $T 2>&1
        if ($LASTEXITCODE -ne 0) {
            $script:BuildFailed = $true
        }
        Write-Host $Output

        if (-not $script:BuildFailed) {
            # Extract output file from nasher output
            $DistFile = $Output | Select-String -Pattern 'build[/\\]dist[/\\][^ ]+\.(mod|hak|tlk)' |
                        ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
            Write-Host ""
            if ($DistFile) {
                Write-Host "Output: $(Join-Path $RepoRoot $DistFile)"
            } else {
                Write-Host "Output: $(Join-Path $RepoRoot 'build\dist\') (check above for filename)"
            }
        }
        Write-Host ""
    }

    if ($Target -eq "all") {
        foreach ($T in @("module", "art", "tlk")) {
            Invoke-BuildTarget $T
        }
    } else {
        Invoke-BuildTarget $Target
    }

    if ($BuildFailed) {
        Write-Host "Build FAILED. See diagnostics above."
        exit 1
    }

    Write-Host "Build complete."
} finally {
    Pop-Location
}
