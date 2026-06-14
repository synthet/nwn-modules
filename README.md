# NWN:EE Aurora Module Project

A Neverwinter Nights: Enhanced Edition module project managed with Nasher for reproducible, source-controlled builds.

## Toolchain (pin these versions)

| Tool | Version | Notes |
|---|---|---|
| NWN:EE | 89.8193.37 (pin one micro-build per team) | Record exact build in release notes |
| Nasher | 1.1.2 | Module/hak/tlk build automation |
| neverwinter.nim | 2.1.2 | CLI utilities and NWScript compiler |
| NWNT | 1.4.0 | GFF conversion helper |
| Git | 2.54.0 | Source control |
| Blender | **4.0.0** (pinned — not latest) | NeverBlender 4.1.0 requires 4.0 or 3.6 |
| NeverBlender | 4.1.0 | Blender → NWN MDL bridge |
| GIMP | 3.2.4 | Texture authoring |
| NVIDIA Texture Tools Exporter | 2024.1.1 | DDS export |

## Environment setup

```sh
# Required environment variables — add to your shell profile
export NWN_ROOT="/path/to/NeverwinterNightsEE"
export NWN_HOME="/path/to/Documents/Neverwinter Nights"
```

## Build workflow

```sh
# First-time setup
nasher init

# Round-trip from Aurora Toolset edits to Git
nasher unpack          # pull toolset changes into src/
git add -p && git commit
nasher install         # push src/ into NWN user folder for testing

# Build release artifacts
nasher pack module
nasher pack art
nasher pack tlk
```

Artifacts are written to `build/dist/`. They are excluded from Git — use GitHub Releases or the Neverwinter Vault for distribution.

## Project structure

```
src/
  module/     — module.ifo and module-level GFF data
  areas/      — .are / .git / .gic per area
  scripts/    — .nss NWScript source
  blueprints/ — .utc / .utp / .uti / .utm / .utt / .utw blueprints
  dialogs/    — .dlg conversation files
  2da/        — custom / merged 2DA extension rows
  tlk/        — custom talk-table entries
art/
  blender/    — .blend source files (do not pack)
  textures/   — editable texture masters (do not pack)
  exports/    — game-ready .mdl / .tga / .dds ready for hak
build/dist/   — generated .mod / .hak / .tlk (git-ignored)
docs/         — design notes and release notes
tools/        — helper scripts for the team
```

## Source file notes

GFF files in `src/` (`.json` extension) are produced by `nasher unpack`. The stubs committed here are illustrative starting points — **replace them by running `nasher unpack` on your seed Aurora Toolset module** before editing content.

2DA files in `src/2da/` contain only the project's **custom rows**. If base-game rows are required, merge into a master 2DA in a top-priority hak early — do not defer this.

## Asset pipeline

```
Meshy / Sloyd (concept mesh)
  → Blender 4.0 import (FBX or OBJ)
  → Cleanup, UV, materials
  → NeverBlender 4.1.0 export
  → .mdl + walkmesh (.pwk / .wok / .dwk)
  → art/exports/
  → packed into starter_art.hak
```

Texture authoring: edit in GIMP, export 24-bit uncompressed TGA for broad compatibility, DDS optionally for size/load optimization.

## Packaging rules

- Module-specific content ships in **haks**, not `override/`.
- Custom placeables: model + textures + walkmesh + `placeables.2da` row + blueprint.
- Custom creatures: model + textures + `appearance.2da` row + blueprint.
- Conflicting 2DAs must be merged into a single master top-priority hak.

## Credits and licensing

Document all third-party asset sources in `docs/` before any public release. Check license terms on each Neverwinter Vault asset used. Keep AI-generated mesh sources separated from hand-authored work in attribution notes.

## Community resources

- [Nasher](https://github.com/squattingmonk/nasher.nim) — build tool documentation
- [neverwinter.nim](https://github.com/niv/neverwinter.nim) — CLI utilities
- [NeverBlender (Vault)](https://neverwintervault.org) — Blender MDL bridge
- [NWN Lexicon](https://nwnlexicon.com) — NWScript function reference
- [Neverwinter Vault](https://neverwintervault.org) — community hub
- [Beamdog Forums](https://forums.beamdog.com) — official modding forums
