#!/usr/bin/env bash
set -euo pipefail

required_paths=(
  "nasher.cfg"
  "src/module/module.ifo.json"
  "src/scripts/mod_on_load.nss"
  "src/scripts/mod_on_client_enter.nss"
  "docs/design/toolchain.md"
  "docs/design/persistent-world-project.md"
)

for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "Missing required path: $path" >&2
    exit 1
  fi
done

echo "Project smoke test passed."
