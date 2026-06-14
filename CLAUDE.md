# NWN:EE Persistent World Module

See also [AGENTS.md](AGENTS.md) for the cross-tool agent briefing (slash commands, skills, MCP setup).

## What this project is

Neverwinter Nights: Enhanced Edition persistent world starter kit. The Nasher text tree under `src/` is the source of truth. `.mod`, `.hak`, `.tlk`, and `.ncs` files are build artifacts — they are excluded from Git and must never be committed.

## Toolchain (pinned — do not bump without review)

See `docs/design/toolchain.md`.

- **NWN:EE** micro-build `89.8193.37`
- **Nasher** `1.1.2` — packs the module, haks, and tlk
- **neverwinter.nim** `2.1.2` — `nwn_script_comp`, `nwn_nwsync_write`, and other tools
- **Blender** `4.0.0` + **NeverBlender** `4.1.0` — custom model pipeline

## Common tasks

```bash
bash tools/smoke-test.sh        # validate project layout
bash tools/compile-scripts.sh   # compile all NWScript sources (needs nwn_script_comp on PATH)
bash tools/build.sh             # nasher pack module only
bash tools/pack.sh              # nasher pack module + art + tlk
bash tools/nwsync-release.sh    # generate a versioned NWSync release
```

## Repository layout

```
src/              Canonical game content (Nasher source tree)
  areas/          Area resources
  blueprints/     Creature, item, placeable blueprints
  dialogs/        Dialogue JSON
  module/         Module properties (module.ifo.json)
  scripts/        NWScript entry scripts and includes
    include/db/   Campaign-DB wrapper layer (backend-agnostic)
  2da/            Rules tables and custom rows
  tlk/            Custom talk table sources
database/
  migrations/     Versioned PostgreSQL migrations (append-only, zero-padded)
  seeds/          Static reference data
docker/           Compose stack files and env templates
deploy/
  systemd/        systemd unit template for host-native deployments
tools/            Build and operations helper scripts
docs/design/      Architecture decisions and operational runbooks
art/              Source art (Blender, textures) — binaries excluded from Git
build/            Build output — excluded from Git
```

## Script naming conventions

| Prefix | Purpose |
|--------|---------|
| `inc_*` | Utility/library includes |
| `db_*` | Database repository functions (NWNX SQL layer) |
| `sys_*` | Gameplay systems |
| `evt_*` | Event dispatcher entry points |
| `qst_*` | Quest logic |
| `adm_*` | Admin/DM commands |
| `plc_*` / `cre_*` / `trg_*` | Per-object scripts |

## Database

- **Production**: PostgreSQL via NWNX:EE SQL plugin (`NWNX_SQL_TYPE=postgresql`)
- **Local dev / caches**: campaign DB (current default in `inc_db_core.nss`)
- Migrations live in `database/migrations/`, are zero-padded, and are **append-only** after deployment
- Run all migrations in staging before promoting to production
- No down-migrations — use backup/restore for rollback

## Docker Compose

```bash
# Local development
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d

# Staging
docker compose --env-file docker/.env.staging \
  -f docker/docker-compose.yml -f docker/docker-compose.staging.yml up -d

# Production
docker compose --env-file docker/.env.prod \
  -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

Secrets (`DATABASE_PASSWORD`, etc.) go in `docker/.env` — never in `docker/env.example` or Git.
For staging/production, also set `NWN_SERVER_IMAGE` to a pinned digest in the env file.

## CI

`.github/workflows/ci.yml` runs on every push and PR:
1. Validates all JSON sources in `src/`
2. Runs `tools/smoke-test.sh`
3. Downloads `nwn_script_comp` from `neverwinter.nim` and compiles all NWScript
4. Packs module + hak + tlk artifacts (on `main` pushes and PRs only)

## Key constraints for Claude

- Never commit `*.mod`, `*.hak`, `*.tlk`, `*.ncs`, `*.erf` — build artifacts
- Never commit `docker/.env`, `docker/.env.staging`, `docker/.env.prod` — contain secrets
- Schema migrations in `database/migrations/` are append-only after deployment
- Toolchain version changes require explicit review — do not bump pins autonomously
- The `inc_db_core.nss` wrapper uses campaign DB now; switching to NWNX SQL is intentional future work, not a bug to fix

## Slash commands (Claude Code)

Type `/` to invoke project workflows defined in `.claude/skills/`:

| Command | Purpose |
|---------|---------|
| `/validate` | JSON + smoke + compile-all |
| `/compile` | Compile `.nss` with diagnostics |
| `/build` | Nasher pack (module/art/tlk/all) |
| `/diff-summary` | Git diff grouped by NWN concept |
| `/find-symbol` | Search NWScript symbols |
| `/resource-lookup` | Find resref in `src/` |
| `/new-script` | Scaffold `.nss` with correct prefix |
| `/new-migration` | Scaffold next SQL migration |
| `/pr-ready` | CI-equivalent checks + PR summary |
| `/adr` | Create architecture decision record |

Background skills (auto-loaded): `nwscript-authoring`, `nwscript-db-layer`, `database-migrations`, `nwn-build-toolchain`, `docker-ops`.

MCP setup: [config/ai/README.md](config/ai/README.md)
