# CLAUDE.md — NWN:EE Module Project

## Project overview

This is a Neverwinter Nights: Enhanced Edition module project targeting a full persistent-world server. The Aurora Toolset is the visual authoring environment; Nasher and Git own the reviewable source and repeatable build process. The project progresses through five phases: local module → private multiplayer → database persistence → public PW launch → live operations.

## Technology stack

| Layer | Technology |
|---|---|
| Scripting language | NWScript (`.nss` files compiled by `nwnsc` or `neverwinter.nim`) |
| Build orchestration | Nasher (`nasher.cfg`) |
| Visual authoring | Aurora Toolset (areas, blueprints, dialogs, journals) |
| PW extensions | NWNX:EE (wrapped in `inc_*` includes) |
| Database | PostgreSQL (migrations in `database/migrations/`) |
| Server deployment | Docker Compose (`docker/`) |
| MCP server | TypeScript (`tools/mcp/nwn-mcp/`) — exposes tooling to AI assistants |
| Unit tests | Python mock harness (`tools/testing/`) |

## Repository structure

```
nwn-modules/
  nasher.cfg              — Nasher build targets (module, art hak, tlk)
  nwn-mcp.config.json     — MCP server config (tool paths, permissions)
  CLAUDE.md               — this file
  CREDITS.md              — third-party asset attribution (required before public release)
  src/
    module/               — module.ifo and module-level GFF data
    areas/                — .are / .git / .gic per area (JSON, produced by nasher unpack)
    scripts/              — NWScript source (.nss)
      include/
        db/               — database include files (inc_db_*.nss)
    blueprints/           — creature/placeable/item/door/encounter/merchant blueprints (JSON)
    dialogs/              — conversation files (.dlg.json)
    2da/                  — custom 2DA extension rows only (not full base-game tables)
    tlk/                  — custom talk-table entries
  art/
    blender/              — .blend source files (do not pack into haks)
    textures/             — editable texture masters (do not pack; export to art/exports/)
    exports/              — game-ready .mdl / .tga / .dds for hak packaging
  build/dist/             — generated .mod / .hak / .tlk (git-ignored; distribute via Releases)
  database/
    migrations/           — ordered PostgreSQL migrations (0001_*.sql, 0002_*.sql, ...)
    seeds/                — optional local/staging seed data
    docs/                 — migration process notes
  docker/
    docker-compose.yml            — base stack (nwserver + db + nwsync/Caddy)
    docker-compose.staging.yml    — staging overlay
    docker-compose.prod.yml       — production overlay
    env.example                   — safe defaults; copy to docker/.env for secrets
    Caddyfile                     — NWSync static file serving config
  docs/
    design/               — architecture decision records and design documents
    ADR/                  — Architecture Decision Records (nwn.docs.add_decision writes here)
    release-notes/        — per-release changelogs
    ATTRIBUTION.md        — third-party content tracker
    BUILD.md              — build workflow summary
    testing.md            — test harness documentation
    mcp-tools.md          — MCP server tool reference
  scripts/                — portable wrapper scripts (bash + PowerShell pairs)
  tools/
    README.md             — tooling script guide
    build.sh              — wrapper: nasher pack module
    compile-scripts.sh    — wrapper: nwnsc compile all
    pack.sh               — wrapper: nasher pack module + art + tlk
    smoke-test.sh         — validate expected project files exist
    ops/                  — database backup/restore/log collection scripts
    mcp/
      nwn-mcp/            — ACTIVE MCP server (TypeScript, vitest)
      nwn-project-mcp/    — earlier MCP server prototype (kept for reference)
    testing/
      mock-runtime/       — Python NWScript API mock
      script-tests/       — Python unit tests for pure NWScript logic
      fixtures/           — test fixture data
  .github/workflows/ci.yml — CI: layout check, mock tests, NWScript compile, MCP build
```

## NWScript conventions

### File naming prefixes

| Prefix | Purpose |
|---|---|
| `inc_*` | Shared constants, utility functions, API wrappers (included by others) |
| `db_*` | Database repository wrappers (NWNX SQL calls go here only) |
| `sys_*` | Gameplay systems (death, login, quests, economy) |
| `evt_*` | Event dispatch helpers (thin wires to system modules) |
| `qst_*` | Quest-specific logic |
| `adm_*` | DM/admin tools |
| `mod_on_*` | Module event entry points (registered in `inc_bootstrap.nss`) |
| `plc_*` | Placeable object scripts |
| `cre_*` | Creature scripts |
| `trg_*` | Trigger scripts |

### Architecture rules

- **Thin event scripts**: `mod_on_client_enter.nss` calls `Event_DispatchClientEnter()`, not business logic directly.
- **No raw SQL in gameplay scripts**: all database calls go through `db_*` includes.
- **No NWNX calls in event scripts**: wrap in `inc_*` or `sys_*` includes so local testing stays possible.
- **Pure logic testable in Python**: keep arithmetic/state-machine logic in pure functions that mirror in `tools/testing/script-tests/`.

### Include order in bootstrap

```
inc_log → inc_config → db_session → sys_registry → Bootstrap_Init()
```

## Build workflow

```sh
# Develop: round-trip from Aurora Toolset edits
nasher unpack          # pull toolset changes into src/
git add -p && git commit
nasher install         # push src/ into NWN user folder for testing (needs NWN_HOME)

# Build release artifacts
nasher pack module     # → build/dist/starter_module.mod
nasher pack art        # → build/dist/starter_art.hak
nasher pack tlk        # → build/dist/starter_project.tlk

# Or use the wrapper
./tools/pack.sh
```

## Testing

```sh
# Run Python mock unit tests (no NWN runtime required)
./scripts/run-script-tests
# or: python3 -m pytest tools/testing/script-tests/ -v

# Compile NWScript (requires nwnsc + NWN_ROOT)
export NWN_ROOT=/path/to/NeverwinterNightsEE
./scripts/compile-scripts

# Validate project layout
./tools/smoke-test.sh
```

## MCP server (AI assistant integration)

The active MCP server is **`tools/mcp/nwn-mcp/`**. Build and use it:

```sh
cd tools/mcp/nwn-mcp
npm install
npm run build
```

Configure your AI client using the example in `tools/mcp/nwn-mcp/examples/mcp-client-config.json`. The server entry point is `dist/server.js`. Full tool reference: `docs/mcp-tools.md`.

### Available MCP tools (use these instead of raw shell commands)

| Tool | What it does |
|---|---|
| `nwn.project.inspect` | Show project structure, counts, and tool config |
| `nwn.project.validate_layout` | Check required folders and config files |
| `nwn.project.diff_summary` | Git diff grouped by NWN concept |
| `nwn.project.create_feature_branch` | Create `feature/<name>` branch |
| `nwn.nasher.build` | Run `nasher pack <target>` |
| `nwn.nasher.validate` | Validate source JSON files |
| `nwn.nasher.resource_lookup` | Find a resref in src/ |
| `nwn.script.compile` | Compile one .nss file |
| `nwn.script.compile_all` | Compile all .nss files |
| `nwn.script.find_symbol` | Search for a function/constant/include |
| `nwn.docs.search` | Search docs/ |
| `nwn.docs.add_decision` | Create an ADR in docs/ADR/ |
| `nwn.aurora.snapshot` | Snapshot a .mod to build/snapshots/ |
| `nwn.nwnx.*` | NWNX server management (gated by config) |

## Environment variables

```sh
export NWN_ROOT="/path/to/NeverwinterNightsEE"  # required for nwnsc compilation
export NWN_HOME="/path/to/Documents/Neverwinter Nights"  # required for nasher install
```

## What Claude should do

- Edit `.nss` files in `src/scripts/` — this is the primary development surface
- Edit blueprint JSON in `src/blueprints/`, `src/dialogs/`
- Write TypeScript in `tools/mcp/nwn-mcp/src/`
- Write SQL migrations in `database/migrations/` (never edit deployed migrations)
- Write Python tests in `tools/testing/script-tests/`
- Update `docs/` design documents and release notes
- Use MCP tools (`nwn.*`) for build, compile, and inspect operations instead of raw shell

## What Claude should NOT do

- Run `nasher install` without confirming — it writes to the user's NWN installation
- Commit `.mod`, `.hak`, `.erf`, or `.tlk` binaries to git
- Delete files in `build/dist/` with raw shell commands — use `nwn.nasher.clean`
- Edit area/dialog files by hand — use the Aurora Toolset; GFF JSON files are Nasher output
- Upgrade pinned tool versions (Nasher, Blender, NeverBlender, NWN:EE) without team review
- Directly run `docker compose down -v` — it destroys persistent database volumes

## Database migrations

- Migration files are named `NNNN_description.sql` and applied once per environment in order.
- Never edit a migration that has been applied to any shared environment.
- Create a new migration to correct schema.
- Always run a database backup before applying migrations.

## Common pitfalls

- `2DA` files in `src/2da/` contain **only custom rows** — do not include full base-game tables.
- GFF JSON stubs in `src/` are illustrative; replace them by running `nasher unpack` on a real seed module.
- `src/tlk/` entries are stable references — treat TLK line numbers as an API.
- The `nwn-project-mcp/` directory is an earlier prototype; the active MCP server is `nwn-mcp/`.
- `docker/.env` must never be committed — only `docker/env.example` is in git.
