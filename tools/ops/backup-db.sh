#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: PW_ENV=<env> DATABASE_URL=<postgres-url> BACKUP_DESTINATION=<dest> [RELEASE_ID=<id>] tools/ops/backup-db.sh

Placeholder only: validates backup inputs and prints the pg_dump action future automation should perform.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

required_vars=(PW_ENV DATABASE_URL BACKUP_DESTINATION)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: required environment variable ${var} is not set." >&2
    usage >&2
    exit 2
  fi
done

release_id="${RELEASE_ID:-manual-$(date -u +%Y%m%dT%H%M%SZ)}"
dump_name="${PW_ENV}-${release_id}.pgdump"

cat <<MSG
Backup placeholder validated required environment for ${PW_ENV}.
Future implementation should run a custom-format PostgreSQL dump, for example:
  pg_dump --format=custom --no-owner --file "${BACKUP_DESTINATION%/}/${dump_name}" "\${DATABASE_URL}"

Expected destination artifact:
  ${BACKUP_DESTINATION%/}/${dump_name}

No backup was created by this placeholder script.
MSG
