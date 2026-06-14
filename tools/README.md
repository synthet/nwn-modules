# Tooling Scripts

This directory contains small wrappers for the recommended NWN:EE Aurora/Nasher workflow. They are intentionally conservative: each script verifies that its required command is installed before running it.

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
export NWN_ROOT="/path/to/NeverwinterNightsEE"
export NWN_HOME="/path/to/Documents/Neverwinter Nights"
```

Operational backup and restore expectations are documented in `docs/design/server-operations.md`.

The scripts do not deploy to a live server. Add staging and production deploy scripts only after the server layout, NWSync URL, and database migration workflow are finalized.
