---
name: docker-ops
description: Docker Compose stacks for local, staging, and production NWN server deployment. Use when working with docker/, NWNX server, or PostgreSQL persistence.
user-invocable: false
---

# Docker operations

## Stacks

```bash
# Local
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d

# Staging
docker compose --env-file docker/.env.staging \
  -f docker/docker-compose.yml -f docker/docker-compose.staging.yml up -d

# Production
docker compose --env-file docker/.env.prod \
  -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## Services

- **nwserver** — NWNX unified image; mounts `build/dist`, runtime modules/hak/tlk
- **db** — PostgreSQL 16; `NWNX_SQL_TYPE=postgresql`
- **nwsync** — Caddy serves `/nwsync/*`

## Secrets

- `docker/env.example` — template only
- Real values in `docker/.env` / `.env.staging` / `.env.prod` (git-ignored)
- Pin `NWN_SERVER_IMAGE` digest for staging/prod

## Host-native

`deploy/systemd/nwn-server.service` wraps the production Compose stack.

## Ops scripts (placeholders)

`tools/ops/backup-db.sh`, `restore-db.sh`, `collect-server-logs.sh` — validate env, document commands.

See `docs/design/server-operations.md`.
