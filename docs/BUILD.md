# Build

Use Nasher as the canonical source/build workflow. Generated `.mod`, `.hak`, `.erf`, and `.tlk` artifacts stay out of Git and should be distributed through release artifacts.

## Prerequisites

- Pinned toolchain per [design/toolchain.md](design/toolchain.md)
- `NWN_TOOLS` and `NWN_ROOT` set (see root `README.md` or `tools/env.ps1` / `tools/env.sh`)
- Nasher config at repo root: `nasher.cfg`

## Build targets

| Target | Command | Output |
|--------|---------|--------|
| Module | `nasher pack module` | `build/dist/starter_module.mod` |
| Art hak | `nasher pack art` | `build/dist/starter_art.hak` |
| Talk table | `nasher pack tlk` | `build/dist/starter_project.tlk` |
| All | `bash tools/pack.sh` | All three artifacts |

Wrapper scripts (load env automatically):

```bash
bash tools/build.sh          # module only
bash tools/compile-scripts.sh
bash tools/pack.sh           # module + art + tlk
bash tools/smoke-test.sh     # layout validation
```

PowerShell:

```powershell
. .\tools\env.ps1
.\scripts\build.ps1
.\scripts\compile-scripts.ps1
.\scripts\pack.ps1
```

## Typical workflow

```bash
# 1. Validate layout
bash tools/smoke-test.sh

# 2. Compile NWScript (requires nwn_script_comp on PATH)
bash tools/compile-scripts.sh

# 3. Pack artifacts
bash tools/pack.sh

# 4. Install to local NWN user folder for in-game test
nasher install
```

After Aurora Toolset edits:

```bash
nasher unpack    # pull GFF JSON into src/
git diff src/
```

## MCP equivalents

When the **nwn-project** MCP server is connected:

| Task | Tool |
|------|------|
| Layout check | `nwn.project.validate_layout` |
| Build | `nwn.nasher.build` |
| Compile all | `nwn.script.compile_all` |
| JSON validate | `nwn.nasher.validate` |

See [mcp-tools.md](mcp-tools.md) for the full reference.

## What gets packed

Configured in `nasher.cfg`:

- **module** — `src/module`, `areas`, `scripts`, `blueprints`, `dialogs`
- **art** — `src/2da/*`, `art/exports/*`
- **tlk** — `src/tlk/*.json`

Current content inventory: [design/game-resources.md](design/game-resources.md).

## CI

`.github/workflows/ci.yml` mirrors local checks: JSON validation, smoke test, compile-all, and pack on `main` pushes and PRs.
