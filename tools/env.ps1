# Dot-source from PowerShell: . .\tools\env.ps1
# Loads repo .env, sets NWN_TOOLS, and prepends NWN_TOOLS\bin to PATH.

$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $RepoRoot '.env'

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }
        if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
            $name = $Matches[1]
            $value = $Matches[2].Trim('"')
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}

if (-not $env:NWN_TOOLS) {
    $env:NWN_TOOLS = 'D:\Projects\nwn-tools'
}

$BinDir = Join-Path $env:NWN_TOOLS 'bin'
if ((Test-Path $BinDir) -and ($env:PATH -notlike "*$BinDir*")) {
    $env:PATH = "$BinDir;$env:PATH"
}

Write-Verbose "NWN_TOOLS=$($env:NWN_TOOLS)"
