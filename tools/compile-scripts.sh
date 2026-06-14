#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="src/scripts"
OUT_DIR="build/ncs"
mkdir -p "$OUT_DIR"

if command -v nwn_script_comp >/dev/null 2>&1; then
  compiler=(nwn_script_comp -i "$SCRIPT_DIR" -i "$SCRIPT_DIR/include/db" -o "$OUT_DIR")
elif command -v nwnsc >/dev/null 2>&1; then
  compiler=(nwnsc -i "$SCRIPT_DIR" -i "$SCRIPT_DIR/include/db" -o "$OUT_DIR")
else
  echo "ERROR: neither nwn_script_comp nor nwnsc is installed or on PATH." >&2
  exit 127
fi

mapfile -t scripts < <(find "$SCRIPT_DIR" -type f -name '*.nss' ! -path "$SCRIPT_DIR/include/*" | sort)
if [[ ${#scripts[@]} -eq 0 ]]; then
  echo "No NWScript sources found under $SCRIPT_DIR."
  exit 0
fi

"${compiler[@]}" "${scripts[@]}"
