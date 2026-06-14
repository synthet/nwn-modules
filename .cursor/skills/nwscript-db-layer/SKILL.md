---
name: nwscript-db-layer
description: Campaign DB wrapper layer and repository patterns in include/db/. Use when editing db_* scripts, inc_db_* includes, or player persistence.
---

# NWScript DB layer

## Architecture

`src/scripts/include/db/` provides a backend-agnostic wrapper:

- `inc_db_core.nss` — availability, timestamps, safe getters
- `inc_db_config.nss` — feature flags
- `inc_db_accounts.nss`, `inc_db_characters.nss`, `inc_db_audit.nss` — repositories

Entry scripts call `db_*` functions; includes hold SQL-ready abstractions.

## Current backend

**Campaign DB** is the active default (`inc_db_core.nss`). Switching to NWNX PostgreSQL is intentional future work — not a bug to fix unprompted.

## Patterns

- Check `DB_IsAvailable()` before writes
- Use repository functions (`DB_*`) — no raw SQL in gameplay scripts
- Audit significant actions via `inc_db_audit.nss`

## PostgreSQL schema

Tables defined in `database/migrations/0001_core_identity.sql`:
`accounts`, `characters`, `character_quest_state`, `factions`, `character_reputation`, `audit_log`

NWNX SQL plugin connects via Docker (`NWNX_SQL_TYPE=postgresql`).
