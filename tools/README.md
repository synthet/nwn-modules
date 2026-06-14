# Tooling Scripts

This directory contains small wrappers for the recommended NWN:EE Aurora/Nasher workflow. They are intentionally conservative: each script verifies that its required command is installed before running it.

## Third-party tools directory

Install Nasher, neverwinter.nim / `nwn_script_comp`, NWNT, and optional NWNX builds outside the Git repo under `NWN_TOOLS`. On this workstation:

```
D:\Projects\nwn-tools\
  bin\    — executables on PATH
  nim\    — neverwinter.nim / Nasher toolchain
  nwnx\   — NWNX:EE (optional)
  nwnt\   — NWNT helper (optional)
```

See [docs/design/nwn-tools-layout.md](../docs/design/nwn-tools-layout.md) for the full file and folder inventory on this machine.

Copy `.env.example` to `.env` at the repo root and set `NWN_TOOLS`. Every script here sources `tools/env.sh`, which loads `.env` and prepends `NWN_TOOLS/bin` to `PATH`.

```powershell
. .\tools\env.ps1   # PowerShell
```

```sh
source tools/env.sh # bash / Git Bash
```

## Scripts

- `build.sh` — builds the module target with Nasher.
- `compile-scripts.sh` — compiles NWScript sources when a supported compiler is available.
- `pack.sh` — packs module, hak, and tlk targets with Nasher.
- `smoke-test.sh` — validates expected project files and directories exist.
- `ops/backup-db.sh` — placeholder for production PostgreSQL backup automation; validates required environment first.
- `ops/restore-db.sh` — placeholder for database restore automation; validates required environment and requires explicit restore confirmation.
- `ops/collect-server-logs.sh` — placeholder for server log collection automation; validates required environment first.

Set these environment variables in your shell profile when working locally:

```sh
export NWN_TOOLS="/path/to/nwn-tools"
export NWN_ROOT="/path/to/NeverwinterNightsEE"
export NWN_HOME="/path/to/Documents/Neverwinter Nights"
```

Operational backup and restore expectations are documented in `docs/design/server-operations.md`.

The scripts do not deploy to a live server. Add staging and production deploy scripts only after the server layout, NWSync URL, and database migration workflow are finalized.
