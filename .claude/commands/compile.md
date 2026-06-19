Compile all NWScript source files.

Requires `nwnsc` (or `nwn_script_comp` from neverwinter.nim) on PATH and `NWN_ROOT` set:

```bash
export NWN_ROOT=/path/to/NeverwinterNightsEE
./scripts/compile-scripts
```

To compile only files changed since HEAD:

```bash
./scripts/compile-scripts --changed-only
```

On Windows (PowerShell):

```powershell
$env:NWN_ROOT = "C:\Program Files (x86)\Neverwinter Nights"
.\scripts\compile-scripts.ps1
.\scripts\compile-scripts.ps1 -ChangedOnly
```

Diagnostics are printed as `file.nss:line: error: message`. Fix all errors before building or committing.
