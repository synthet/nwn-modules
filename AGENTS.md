# AGENTS.md — NWN:EE persistent world module

Cross-tool briefing for Cursor, Claude Code, Codex, and other AI assistants. For full project context see [CLAUDE.md](CLAUDE.md). For IDE/MCP setup see [config/ai/README.md](config/ai/README.md).

## What this project is

Neverwinter Nights: Enhanced Edition persistent-world starter kit. The Nasher text tree under `src/` is the source of truth. `.mod`, `.hak`, `.tlk`, and `.ncs` files are build artifacts — never commit them.

## Repository layout

```
src/              Canonical game content (Nasher source tree)
  scripts/        NWScript entry scripts and includes
    include/db/   Campaign-DB wrapper layer (backend-agnostic)
  module/         module.ifo.json and module properties
  areas/          Area resources
  dialogs/        Dialogue JSON
  blueprints/     Creature, item, placeable blueprints
  2da/            Rules tables and custom rows
  tlk/            Custom talk table sources
database/migrations/   PostgreSQL schema (append-only after deploy)
tools/            Build scripts and MCP server
docs/design/      Architecture and operational runbooks
build/            Generated artifacts (git-ignored)
```

## Toolchain (pinned — do not bump without review)

| Tool | Version |
|------|---------|
| NWN:EE | 89.8193.37 |
| Nasher | 1.1.2 |
| neverwinter.nim | 2.1.2 |
| Blender + NeverBlender | 4.0.0 + 4.1.0 |

Details: [docs/design/toolchain.md](docs/design/toolchain.md)

## NWScript conventions

| Prefix | Purpose |
|--------|---------|
| `inc_*` | Utility/library includes |
| `db_*` | Database repository functions |
| `sys_*` | Gameplay systems |
| `evt_*` | Event dispatcher entry points |
| `qst_*` | Quest logic |
| `adm_*` | Admin/DM commands |
| `plc_*` / `cre_*` / `trg_*` | Per-object scripts |

**Event chain:** `mod_on_load.nss` → `evt_module.nss` → `inc_bootstrap.nss`; client events via `evt_on_enter.nss` / `evt_on_leave.nss` → `evt_client.nss`.

DB layer lives in `src/scripts/include/db/` (`inc_db_*`). Campaign DB is the current default in `inc_db_core.nss` — NWNX PostgreSQL is intentional future work.

## Common shell commands

```bash
bash tools/smoke-test.sh        # validate project layout
bash tools/compile-scripts.sh   # compile all NWScript
bash tools/build.sh             # nasher pack module
bash tools/pack.sh              # nasher pack module + art + tlk
```

On Windows: `. .\tools\env.ps1`, then `scripts/*.ps1` wrappers.

## MCP vs shell

Prefer **nwn-project** MCP tools when connected:

| Task | MCP tool |
|------|----------|
| Project layout | `nwn.project.inspect`, `nwn.project.validate_layout` |
| Build | `nwn.nasher.build` |
| Compile | `nwn.script.compile`, `nwn.script.compile_all`, `nwn.script.diagnostics` |
| Search | `nwn.script.find_symbol`, `nwn.nasher.resource_lookup` |
| Git diff | `nwn.project.diff_summary` |
| Docs / ADR | `nwn.docs.search`, `nwn.docs.add_decision` |

Fall back to `tools/*.sh` or `scripts/*.ps1` when MCP is unavailable. Full reference: [docs/mcp-tools.md](docs/mcp-tools.md).

## Slash commands

Type `/` in Cursor or Claude Code:

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
| `/commit-and-push` | Commit and push with git safety rules |
| `/adr` | Create architecture decision record |

| IDE | Slash commands | Background skills |
|-----|----------------|-------------------|
| Cursor | `.cursor/commands/*.md` | `.cursor/skills/` |
| Claude Code | `.claude/skills/` (`user-invocable: true`) | `.claude/skills/` (`user-invocable: false`) |

## Background skills

| Skill | Use when |
|-------|----------|
| `nwscript-authoring` | Writing or editing `.nss` |
| `nwscript-db-layer` | `db_*` / `inc_db_*` persistence |
| `database-migrations` | SQL migrations |
| `nwn-build-toolchain` | Build, pack, env setup |
| `docker-ops` | Compose stacks, staging/prod |

## Cursor rules

`.cursor/rules/` — file-scoped guidance:

| Rule | Scope |
|------|-------|
| `nwn-core.mdc` | Always apply |
| `mcp-toolchain.mdc` | Always apply |
| `nwscript.mdc` | `**/*.nss` |
| `nasher-json.mdc` | `src/**/*.json` |
| `database-migrations.mdc` | `database/migrations/**` |
| `docker-secrets.mdc` | `docker/**` |

Claude Code has no `.mdc` rules format — follow this file and `CLAUDE.md`.

## MCP setup (quickstart)

1. `cd tools/mcp/nwn-project-mcp && npm install && npm run build`
2. `cp nwn-mcp.config.example.json nwn-mcp.config.json` — edit Aurora path locally
3. `cp .cursor/mcp.json.example .cursor/mcp.json` — set `NWN_ROOT`
4. `cp tools/mcp/nwn-project-mcp/.env.example tools/mcp/nwn-project-mcp/.env`
5. Restart IDE; verify with `nwn.project.inspect`

Canonical MCP package: `tools/mcp/nwn-project-mcp` (CI-built).

## CI checks (mirror with `/pr-ready`)

`.github/workflows/ci.yml` validate job:

1. JSON-validate all `src/**/*.json`
2. `tools/smoke-test.sh`
3. `tools/compile-scripts.sh` (when `nwn_script_comp` available)

## Database

- Migrations: `database/migrations/`, zero-padded, **append-only after deploy**
- No down-migrations — backup/restore or forward-fix migration
- Staging before production for every schema change
- Secrets in `docker/.env*` only — never commit

## Hard constraints

- Never commit `*.mod`, `*.hak`, `*.tlk`, `*.ncs`, `*.erf`
- Never commit `.env`, `docker/.env`, `docker/.env.staging`, `docker/.env.prod`
- Never commit `nwn-mcp.config.json` or `.cursor/mcp.json` (use `*.example.json`)
- Do not bump toolchain pins without explicit review
- Do not enable dangerous MCP permissions (`allowDeleteFiles`, `allowStartServer`) without user request
