# Database migrations

This directory stores database changes for the persistent-world server. The Phase 3 target database is PostgreSQL, with SQLite reserved only for throwaway local prototypes.

## Directory layout

- `database/migrations/` contains ordered SQL migrations that change schema or required reference data.
- `database/seeds/` contains optional seed data for local development or staging smoke tests.
- `database/docs/` contains database process notes, including this file.

## Migration rules

1. Name migrations with a zero-padded sequence and a short description, such as `0001_core_identity.sql`.
2. Apply migrations in filename order, exactly once per database environment.
3. Keep every migration deterministic and safe to run in an automated deployment pipeline.
4. Prefer explicit column types, constraints, indexes, and foreign-key behavior.
5. Include required reference data in migrations only when production needs it to run.
6. Keep optional sample data in `database/seeds/`, not in schema migrations.
7. After a migration has been deployed to any shared environment, treat it as append-only: **do not edit deployed migrations in place**. Create a new migration to correct or extend the schema.

## Rollback expectations

Migrations are the forward history of the database. Production rollback should normally restore a verified backup or deploy a new forward-fix migration rather than rewriting migration files.

For every release that includes database changes:

- Take or verify a database backup before applying migrations.
- Confirm the application/module version that matches the migrated schema.
- Document any manual recovery steps in the release notes.
- If data must be transformed destructively, stage and test the restore path before production deployment.

Down migrations are optional unless the deployment tool later requires them. If a down migration is added, it must preserve data safety expectations and must not replace backup-based recovery planning.

## Environment separation

Keep local, staging, and production databases separate. Never point local tools or staging servers at production credentials.

- **Local** databases may use disposable data and optional files from `database/seeds/`.
- **Staging** should mirror production schema and use sanitized seed/test data only.
- **Production** must use production-only credentials, backups, monitoring, and audited access.

Seed files are never required for production startup unless a later migration explicitly promotes that data into an ordered migration.
