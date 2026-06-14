#!/usr/bin/env bash
# Source from other tools/*.sh scripts or your shell profile.
# Usage: source "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/tools/env.sh"

_env_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
_env_file="${_env_root}/.env"

if [[ -f "$_env_file" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      value="${value%\"}"
      value="${value#\"}"
      export "$key=$value"
    fi
  done < "$_env_file"
fi

: "${NWN_TOOLS:=}"

if [[ -n "$NWN_TOOLS" && -d "$NWN_TOOLS/bin" ]]; then
  case ":$PATH:" in
    *":$NWN_TOOLS/bin:"*) ;;
    *) export PATH="$NWN_TOOLS/bin:$PATH" ;;
  esac
fi

export NWN_TOOLS
