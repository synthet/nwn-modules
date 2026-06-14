#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/env.sh"

if ! command -v nasher >/dev/null 2>&1; then
  echo "ERROR: nasher is not installed or not on PATH." >&2
  exit 127
fi

mkdir -p build/dist
nasher pack module
