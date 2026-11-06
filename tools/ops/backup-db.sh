#!/usr/bin/env bash
# Backup PostgreSQL database to docker/backups/
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/docker/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

DATABASE_NAME="${DATABASE_NAME:-nwn_persistent_world}"
DATABASE_USER="${DATABASE_USER:-nwn}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/backups/${STAMP}-${DATABASE_NAME}.dump"

docker compose --env-file "$ENV_FILE" -f "$ROOT/docker/docker-compose.yml" exec -T db \
  pg_dump -U "$DATABASE_USER" -d "$DATABASE_NAME" -Fc -f "$OUT"

echo "Backup written to docker/backups/$(basename "$OUT")"
