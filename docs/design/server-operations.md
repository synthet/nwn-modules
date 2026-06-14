# Server operations

This runbook describes local/private NWN:EE multiplayer operations using the compose files in `docker/`. It is written for a small persistent-world stack with three services:

- `nwserver` for the NWN dedicated server runtime.
- `db` for persistent world data in PostgreSQL.
- `nwsync` for optional static NWSync hosting from the same host.

The compose files are deployment scaffolding. Before any public launch, pin the NWN server image in `docker/.env`, rehearse backup/restore, and verify the exact runtime paths expected by the selected NWN/NWNX container image.

## First-time setup

1. Build module artifacts with the normal Nasher workflow so release files exist under `build/dist/`.
2. Create local runtime directories:

   ```sh
   mkdir -p docker/runtime/{modules,hak,tlk,logs,nwsync} docker/backups
   ```

3. Copy `docker/env.example` to `docker/.env` and set host-specific values. Do not commit `docker/.env`.
4. Copy or sync the built module, hak, and tlk files into the matching `docker/runtime/` folders expected by the selected server image.
5. If serving NWSync from the same host, generate the NWSync manifest/payloads and place them under `docker/runtime/nwsync/`.

## Startup

Start the local/private stack from the repository root:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d
```

Check service state and health:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml ps
docker compose --env-file docker/.env -f docker/docker-compose.yml logs -f nwserver
```

For staging or production, include the appropriate overlay:

```sh
docker compose --env-file docker/.env.staging -f docker/docker-compose.yml -f docker/docker-compose.staging.yml up -d
docker compose --env-file docker/.env.prod -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## Shutdown

For routine maintenance, stop services without deleting volumes:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml stop nwserver
```

Stop the entire local stack while keeping database and runtime volumes:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml down
```

Do not use `down -v` unless intentionally destroying local persistent data.

## Backup

Take a database backup before every deployment, migration, or rollback. The PostgreSQL service mounts `docker/backups` at `/backups` for local/private operations:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml exec db \
  pg_dump -U "$DATABASE_USER" -d "$DATABASE_NAME" -Fc \
  -f "/backups/$(date -u +%Y%m%dT%H%M%SZ)-${DATABASE_NAME}.dump"
```

Also archive runtime content that cannot be recreated from Git or release artifacts, such as local vaults, campaign database files, logs needed for investigation, and generated NWSync manifests.

## Restore

Restore only into a stopped or isolated target environment. For local restore:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml stop nwserver
docker compose --env-file docker/.env -f docker/docker-compose.yml exec db \
  pg_restore -U "$DATABASE_USER" -d "$DATABASE_NAME" --clean --if-exists \
  "/backups/YYYYMMDDTHHMMSSZ-${DATABASE_NAME}.dump"
docker compose --env-file docker/.env -f docker/docker-compose.yml start nwserver
```

After restore, validate server startup, module load, database connectivity, and at least one client login before declaring the environment healthy.

## Staging promotion

Use staging as the final rehearsal environment before production:

1. Build immutable release artifacts from a tagged commit.
2. Deploy those artifacts to `docker/runtime-staging/` and publish staging NWSync payloads.
3. Restore a recent production backup into staging if the test requires realistic persistent data.
4. Start staging with `docker/docker-compose.staging.yml`.
5. Run smoke checks: server process starts, module loads, logs are clean, database reads/writes work, NWSync downloads succeed, and a player can connect.
6. Record the artifact versions, database migration version, NWSync manifest, and commit hash.
7. Promote the same artifacts to production; do not rebuild different binaries for production.

## Production rollback

Rollback must restore a known-good pairing of module artifacts, NWSync payloads, and database state:

1. Announce maintenance mode and prevent new logins.
2. Stop `nwserver` but leave `db` running long enough to capture a final emergency backup.
3. Save current logs and the current failed artifact set for investigation.
4. Restore the last known-good module/hak/tlk files and matching NWSync payloads.
5. If the deployment changed schema or persistent data, restore the matching database backup or run a reviewed down-migration.
6. Start `nwserver` and watch logs through the first player login.
7. Keep the incident branch and failed artifacts quarantined until the root cause is understood.

## Logs

Use compose logs for live service output:

```sh
docker compose --env-file docker/.env -f docker/docker-compose.yml logs -f nwserver
docker compose --env-file docker/.env -f docker/docker-compose.yml logs -f db
docker compose --env-file docker/.env -f docker/docker-compose.yml logs -f nwsync
```

The compose stack also mounts NWN runtime logs under `docker/runtime/logs` for local/private deployments. Rotate or archive large logs before disk usage impacts the host.

## Maintenance mode

For planned maintenance:

1. Announce the maintenance window in-game and in community channels.
2. Disable public listing or apply a temporary password if supported by the selected NWN server image/configuration.
3. Stop accepting new players before shutdown.
4. Take a fresh backup.
5. Deploy artifacts or perform database maintenance.
6. Start the server privately and run smoke checks.
7. Re-enable normal access and monitor logs.

For emergency maintenance, prioritize data preservation: stop new logins, snapshot logs, back up the database, and only then make changes.
