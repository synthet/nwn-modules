# Compile all NWScript files using nwnsc.
# Requires: nwnsc on PATH, NWN_ROOT env var pointing to NWN installation.
# Usage: .\scripts\compile-scripts.ps1 [-ChangedOnly]

[CmdletBinding()]
param(
    [switch]$ChangedOnly
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..")
$ScriptsDir = Join-Path $RepoRoot "src\scripts"

# Check for nwnsc
if (-not (Get-Command "nwnsc" -ErrorAction SilentlyContinue)) {
    Write-Error @"
ERROR: nwnsc not found on PATH.

Install instructions:
  Windows: https://github.com/nwnsc/nwnsc/releases
  Download nwnsc.exe and place it on your PATH, e.g.:
    Copy-Item nwnsc.exe "C:\Windows\System32\"

  Or add the folder containing nwnsc.exe to your PATH via:
    System Properties -> Environment Variables -> Path
"@
    exit 1
}

# Warn if NWN_ROOT is not set
if (-not $env:NWN_ROOT) {
    Write-Warning "NWN_ROOT is not set. nwnsc may not find NWN data files."
    Write-Warning "Set NWN_ROOT to your NWN installation directory, e.g.:"
    Write-Warning '  $env:NWN_ROOT = "C:\Program Files (x86)\Neverwinter Nights"'
    Write-Host ""
}

# Collect .nss files
if ($ChangedOnly) {
    Write-Host "Mode: -ChangedOnly (diffing against HEAD)"
    $ChangedFiles = & git -C $RepoRoot diff --name-only HEAD -- 'src/scripts/*.nss' 2>$null
    $NssFiles = $ChangedFiles | ForEach-Object { Join-Path $RepoRoot $_ } | Where-Object { Test-Path $_ }
    if ($NssFiles.Count -eq 0) {
        Write-Host "No changed .nss files found relative to HEAD."
        Write-Host "0 compiled, 0 failed"
        exit 0
    }
} else {
    $NssFiles = Get-ChildItem -Path $ScriptsDir -Filter "*.nss" -Recurse | Select-Object -ExpandProperty FullName | Sort-Object
}

if ($NssFiles.Count -eq 0) {
    Write-Host "No .nss files found in $ScriptsDir"
    Write-Host "0 compiled, 0 failed"
    exit 0
}

$Compiled = 0
$Failed   = 0

foreach ($NssFile in $NssFiles) {
    $RelPath = $NssFile.Replace($RepoRoot.ToString(), "").TrimStart("\", "/")
    Write-Host -NoNewline "  Compiling: $RelPath ... "

    # Build nwnsc args
    $NwnscArgs = @("-e", "-o", "NUL")
    if ($env:NWN_ROOT) {
        $NwnscArgs += @("-n", $env:NWN_ROOT)
    }
    $NwnscArgs += $NssFile

    # Run nwnsc
    $Output = & nwnsc @NwnscArgs 2>&1
    $ExitCode = $LASTEXITCODE

    if ($ExitCode -eq 0) {
        Write-Host "OK"
        $Compiled++
    } else {
        Write-Host "FAILED"
        $Failed++
        foreach ($Line in $Output) {
            # nwnsc format: "filename.nss(42): Error: message"
            # Reformat to: filepath:line: severity: message
            if ($Line -match '^(.+)\((\d+)\): (.+)$') {
                $DiagFile = $Matches[1]
                $DiagLine = $Matches[2]
                $DiagMsg  = $Matches[3]
                Write-Host "    ${DiagFile}:${DiagLine}: $DiagMsg"
            } else {
                Write-Host "    $Line"
            }
        }
    }
}

Write-Host ""
Write-Host "Summary: $Compiled compiled, $Failed failed"

if ($Failed -gt 0) {
    exit 1
}
