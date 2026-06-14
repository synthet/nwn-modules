# Server Operations Backup and Restore

This document defines the minimum operational backup and restore expectations for production deploys of the persistent world server. Treat these steps as release-blocking until the team has a tested automation pipeline.

Use this document as the canonical restore runbook for the operational backup set. Higher-level design documents may link to it, but production deploy checklists should keep the detailed artifact list, script contract, and restore drill cadence here so operators do not have to reconcile competing instructions during an incident.

## Pre-Deploy Backup Checklist

Before every production deploy, capture enough state to return the live server to the exact previously released build and database contents.

Back up the following artifacts:

- **PostgreSQL dump**: take a consistent dump of the production database before applying migrations or starting the new server build. Store the dump with the release identifier and timestamp; prefer a custom-format dump so future automation can use `pg_restore`.
- **Module file (`.mod`)**: preserve the currently running module package, not only the newly built candidate.
- **HAK files (`.hak`)**: archive every custom HAK that the current production module requires.
- **TLK files (`.tlk`)**: archive every custom talk table used by the current production module.
- **NWSync manifest and content**: save the currently published NWSync manifest plus the content-addressed data it references so clients can continue to resolve the rollback version. Treat NWSync releases as immutable directories and delay pruning until rollback content is no longer needed.
- **Environment files**: back up deployment-specific environment files and secret references, including database connection settings, server profile settings, ports, feature flags, and paths. Store secrets only in the approved secure backup location.
- **Release notes**: save the release notes for both the currently deployed version and the candidate version so operators can confirm what changed and what rollback means.

## Backup Script Placeholders

Placeholder scripts live in `tools/ops/`:

- `backup-db.sh` checks required environment variables and reports the custom-format `pg_dump` command that future automation should run.
- `restore-db.sh` checks required environment variables, reports the matching `pg_restore` command, and refuses to restore unless explicitly confirmed.
- `collect-server-logs.sh` checks required environment variables and reports the log archive destination that future automation should populate.

The placeholders intentionally do not perform destructive operations. They exist to standardize required inputs before production-specific commands are added.

Required environment variables:

- `PW_ENV`: deployment environment name, such as `staging` or `production`.
- `DATABASE_URL`: PostgreSQL connection string for backup or restore operations.
- `BACKUP_DESTINATION`: approved destination directory, bucket, or mount for backup artifacts.

Optional environment variables:

- `RELEASE_ID`: immutable release identifier, normally the Git SHA, tag, or release train name. If omitted, placeholders use a UTC timestamped manual identifier.
- `BACKUP_SOURCE`: source dump path for restore drills and restore operations.
- `LOG_SOURCE_DIR`: server log directory for log collection.
- `RESTORE_CONFIRM`: must be set to `YES` before `restore-db.sh` will proceed past its safety gate.

## Release Bundle Layout

Store backup artifacts in a release-scoped bundle so a rollback does not depend on tribal knowledge. A production bundle should include paths equivalent to:

```text
<backup-destination>/<release-id>/
  database/<pw-env>-<release-id>.pgdump
  module/*.mod
  hak/*.hak
  tlk/*.tlk
  nwsync/manifest-and-content/
  env/
  release-notes.md
  logs/
```

Do not commit secrets to Git. Environment backups should either contain sanitized templates plus secret-manager references or be stored only in the approved encrypted backup location.

## Restore Drills

Practice restores on a non-production environment at least once per quarter and before the first production launch. Also run an extra drill after any major change to database schema migration tooling, NWSync publishing, server hosting, or backup storage.

Each restore drill should prove that operators can:

1. Locate the PostgreSQL dump, module package, HAK files, TLK files, NWSync manifest/content, environment files, and release notes for a named release.
2. Restore the database into an isolated staging database.
3. Reconstruct the exact server content set from the backed-up `.mod`, `.hak`, `.tlk`, and NWSync artifacts.
4. Start the server using restored environment configuration or verified secret references.
5. Connect with a test client and confirm that login, area loading, conversations, and persistence work.
6. Record drill date, release identifier, restore duration, operator names, issues found, and follow-up actions in release notes or the operations log.

A restore process is not considered production-ready until a second operator can repeat it from documentation without relying on the original author.

## Pre-Production Promotion Gate

Do not promote a release to production until an operator has confirmed that:

1. The current production release bundle exists and contains the database dump, `.mod`, `.hak`, `.tlk`, NWSync, environment, release-note, and log artifacts described above.
2. The candidate release notes identify every migration, content package, and NWSync publication step that would need to be rolled back.
3. The placeholder scripts have been run with the target `PW_ENV` values so missing environment variables are caught before the maintenance window.
4. The most recent restore drill is still within the required cadence, or an out-of-band drill has been scheduled before launch when the release changes database, NWSync, or hosting assumptions.
