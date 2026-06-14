---
name: new-migration
description: Scaffold the next zero-padded PostgreSQL migration. Use when user says /new-migration.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob
---

Scaffold the next PostgreSQL migration. Read skill `database-migrations` for rules.

## Input

Description in $ARGUMENTS, e.g. `/new-migration add_quest_tables`.

## Steps

1. List `database/migrations/` for next sequence number
2. Create `NNNN_<description>.sql` with `BEGIN;` / `COMMIT;`
3. Never edit existing deployed migrations

## Output

Report file path and append-only reminder.
