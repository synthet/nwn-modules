Scaffold the next PostgreSQL migration file. Follow `.cursor/rules/database-migrations.mdc` and `.cursor/skills/database-migrations/SKILL.md`.

## Input

Short description after the command, e.g. `/new-migration add_quest_tables`.

## Steps

1. List `database/migrations/` and determine next zero-padded number
2. Create `database/migrations/NNNN_<description>.sql`
3. Wrap in `BEGIN;` / `COMMIT;` like `0001_core_identity.sql`
4. Use explicit types, constraints, and indexes
5. Do not edit existing migration files

## Template

```sql
-- NNNN_<description>.sql
-- <One-line purpose>

BEGIN;

-- DDL here

COMMIT;
```

## Output format

```markdown
## Created
- File: database/migrations/NNNN_<description>.sql
- Previous migration: NNNN_...

## Reminder
- Append-only after deploy
- Test in staging before production
```
