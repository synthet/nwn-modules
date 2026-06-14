#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: PW_ENV=<env> DATABASE_URL=<postgres-url> BACKUP_DESTINATION=<dest> BACKUP_SOURCE=<dump> RESTORE_CONFIRM=YES tools/ops/restore-db.sh

Placeholder only: validates restore inputs and prints the pg_restore action future automation should perform.
RESTORE_CONFIRM=YES is always required so accidental restores fail closed.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

required_vars=(PW_ENV DATABASE_URL BACKUP_DESTINATION BACKUP_SOURCE)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: required environment variable ${var} is not set." >&2
    usage >&2
    exit 2
  fi
done

if [[ "${RESTORE_CONFIRM:-}" != "YES" ]]; then
  echo "ERROR: refusing to restore without RESTORE_CONFIRM=YES." >&2
  usage >&2
  exit 3
fi

cat <<MSG
Restore placeholder validated required environment for ${PW_ENV}.
Future implementation should restore BACKUP_SOURCE into DATABASE_URL, for example:
  pg_restore --clean --if-exists --no-owner --dbname "\${DATABASE_URL}" "${BACKUP_SOURCE}"

Backup source:
  ${BACKUP_SOURCE}
Backup destination/reference:
  ${BACKUP_DESTINATION}

No database restore was performed by this placeholder script.
MSG
