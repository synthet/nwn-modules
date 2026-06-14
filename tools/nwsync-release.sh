#!/usr/bin/env bash
# Generate an immutable, versioned NWSync release from current build artifacts.
#
# Usage:
#   tools/nwsync-release.sh [ref]
#
# Arguments:
#   ref   Optional. Git ref used as the release identifier (defaults to HEAD short SHA).
#
# Environment:
#   BUILD_DIR    Path to built .mod/.hak/.tlk artifacts (default: build/dist)
#   NWSYNC_ROOT  Root path for NWSync releases (default: docker/runtime/nwsync)
#
# Requires: nwn_nwsync_write from neverwinter.nim 2.1.2+ on PATH.
#
# Release layout:
#   $NWSYNC_ROOT/releases/<ref>/   immutable release payload
#   $NWSYNC_ROOT/current -> ...    symlink to the active release (updated atomically)
#
# After confirming the new release is live, prune old releases:
#   nwn_nwsync_prune --repository "$NWSYNC_ROOT/releases/<old-ref>"

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-build/dist}"
NWSYNC_ROOT="${NWSYNC_ROOT:-docker/runtime/nwsync}"
RELEASE_REF="${1:-$(git rev-parse --short HEAD)}"
RELEASE_DIR="${NWSYNC_ROOT}/releases/${RELEASE_REF}"

# Validate dependencies
if ! command -v nwn_nwsync_write >/dev/null 2>&1; then
    echo "ERROR: nwn_nwsync_write not found." >&2
    echo "       Install neverwinter.nim tools: https://github.com/niv/neverwinter.nim" >&2
    exit 127
fi

if ! command -v git >/dev/null 2>&1; then
    echo "ERROR: git not found on PATH." >&2
    exit 127
fi

# Validate build artifacts exist
missing=()
for f in "${BUILD_DIR}/starter_module.mod" "${BUILD_DIR}/starter_art.hak" "${BUILD_DIR}/starter_project.tlk"; do
    [[ -f "$f" ]] || missing+=("$f")
done
if [[ ${#missing[@]} -gt 0 ]]; then
    echo "ERROR: Missing build artifacts — run 'bash tools/pack.sh' first:" >&2
    printf '  %s\n' "${missing[@]}" >&2
    exit 1
fi

echo "==> NWSync release: ${RELEASE_REF}"
echo "    Source:  ${BUILD_DIR}"
echo "    Target:  ${RELEASE_DIR}"

mkdir -p "${RELEASE_DIR}"

nwn_nwsync_write \
    --repository "${RELEASE_DIR}" \
    "${BUILD_DIR}/starter_module.mod" \
    "${BUILD_DIR}/starter_art.hak" \
    "${BUILD_DIR}/starter_project.tlk"

# Atomically update the "current" symlink so the web server serves the new release
CURRENT_LINK="${NWSYNC_ROOT}/current"
ln -snf "releases/${RELEASE_REF}" "${CURRENT_LINK}"

echo ""
echo "==> Done. Serve '${CURRENT_LINK}' (-> releases/${RELEASE_REF}) via nginx/Caddy."
echo ""
echo "    To prune a previous release after confirming the new one is live:"
echo "    nwn_nwsync_prune --repository ${NWSYNC_ROOT}/releases/<old-ref>"
