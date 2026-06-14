#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: PW_ENV=<env> BACKUP_DESTINATION=<dest> LOG_SOURCE_DIR=<dir> [RELEASE_ID=<id>] tools/ops/collect-server-logs.sh

Placeholder only: validates log collection inputs and prints the archive action future automation should perform.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

required_vars=(PW_ENV BACKUP_DESTINATION LOG_SOURCE_DIR)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: required environment variable ${var} is not set." >&2
    usage >&2
    exit 2
  fi
done

release_id="${RELEASE_ID:-manual-$(date -u +%Y%m%dT%H%M%SZ)}"
archive_name="${PW_ENV}-${release_id}-server-logs.tar.gz"

cat <<MSG
Log collection placeholder validated required environment for ${PW_ENV}.
Future implementation should collect logs, for example:
  tar -czf "${BACKUP_DESTINATION%/}/${archive_name}" -C "${LOG_SOURCE_DIR}" .

Expected destination artifact:
  ${BACKUP_DESTINATION%/}/${archive_name}

No logs were collected by this placeholder script.
MSG
