---
name: database-migrations
description: PostgreSQL migration naming, append-only rules, and staging checklist. Use when creating or reviewing database/migrations/ SQL files.
user-invocable: false
---

# Database migrations

## Naming

`NNNN_short_description.sql` — zero-padded, e.g. `0002_add_quest_tables.sql`.

## Rules

1. Apply in filename order, once per environment.
2. **Append-only after deploy** — never edit applied migrations; add a new file to fix.
3. No required down-migrations; rollback = backup restore or forward-fix.
4. Production reference data → migration; optional dev data → `database/seeds/`.
5. Test in staging before production.

## New migration workflow

1. List existing files in `database/migrations/`
2. Pick next sequence number
3. Write deterministic SQL with explicit types and constraints
4. Document manual steps in release notes if needed
5. Verify against local Docker PostgreSQL

## Release checklist

- [ ] Backup taken before apply
- [ ] Module version matches schema expectations
- [ ] Staging migration succeeded
- [ ] No secrets in migration files

See `database/docs/README.md`.
