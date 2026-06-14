---
name: nwn-build-toolchain
description: Nasher build targets, env setup, compile and pack workflow for NWN:EE modules. Use when building, packing, or configuring the development toolchain.
user-invocable: false
---

# NWN build toolchain

## Environment

```bash
cp .env.example .env   # set NWN_TOOLS, NWN_ROOT, NWN_HOME
source tools/env.sh    # Linux/macOS
. .\tools\env.ps1      # Windows
```

## Nasher targets (nasher.cfg)

| Target | Output |
|--------|--------|
| `module` | `build/dist/starter_module.mod` |
| `art` | `build/dist/starter_art.hak` |
| `tlk` | `build/dist/starter_project.tlk` |

## Commands

```bash
bash tools/smoke-test.sh
bash tools/compile-scripts.sh
bash tools/build.sh          # pack module
bash tools/pack.sh           # pack module + art + tlk
bash tools/nwsync-release.sh # versioned NWSync release
```

PowerShell: `scripts/build-module.ps1`, `scripts/compile-scripts.ps1`.

## MCP equivalents

- `nwn.nasher.build` — pack target
- `nwn.nasher.validate` — JSON + layout
- `nwn.script.compile_all` — all scripts

## Artifacts

All outputs under `build/` are git-ignored. Distribute via Releases or Vault.

## Pins

Do not bump versions in `docs/design/toolchain.md` without team review.
