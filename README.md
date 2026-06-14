# NWN:EE Aurora Module Project

A Neverwinter Nights: Enhanced Edition module project managed with Nasher for reproducible, source-controlled builds. The Aurora Toolset is the authoring UI; Git and Nasher own the reviewable source and repeatable build process.

## Recommended toolchain (pin these versions)

| Component | Version | Notes |
|---|---|---|
| NWN:EE | 89.8193.37 (pin one micro-build per team) | Record exact storefront/build in release notes — do not let contributors drift |
| Aurora Toolset | Bundled with pinned NWN:EE install | Canonical editor for areas, blueprints, conversations, journals, module properties |
| Nasher | 1.1.2 | Source-controlled build orchestration: module/hak/erf/tlk targets, unpack/install round-trip |
| neverwinter.nim | 2.1.2 | Modern open-source NWN CLI utilities and `nwn_script_comp` compiler |
| NWNT | 1.4.0 | GFF conversion helper for Nasher-era workflows |
| Git | 2.54.0 | Team collaboration and reproducible history |
| Blender | **4.0.0** (pinned — not latest) | NeverBlender 4.1.0 requires 4.0 or 3.6; newer Blender is not safe for NWN by default |
| NeverBlender | 4.1.0 | Blender → NWN MDL bridge: import/export, walkmesh classes, EE material support |
| GIMP | 3.2.4 | Cross-platform texture editing and TGA authoring |
| NVIDIA Texture Tools Exporter | 2024.1.1 | Optional DDS export/compression |

The two most important pins are the NWN:EE build line and the Blender/NeverBlender pairing. Propose toolchain changes through normal review so the team can test authoring, build, and runtime impact together.

## Environment setup

```sh
# Required environment variables — add to your shell profile
export NWN_ROOT="/path/to/NeverwinterNightsEE"
export NWN_HOME="/path/to/Documents/Neverwinter Nights"
```

## Project principles

1. Use the Aurora Toolset for visual/module authoring.
2. Use Nasher for unpacking, building, installing, and packaging project assets.
3. Keep reviewable source in Git instead of treating generated `.mod`, `.hak`, or `.tlk` files as the source of truth.
4. Package reusable custom content into haks and tlks rather than asking players or testers to install loose override files.
5. Keep personal paths, local user settings, and generated install artifacts out of version control.
6. Document third-party asset permissions before the first public beta.

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

## Nasher workflow

```bash
nasher init myproject
cd myproject
nasher unpack
# edit sources or use the Aurora Toolset
nasher install
# test in NWN:EE
nasher unpack
# review and commit source changes
```

When the module grows, keep the module, custom haks, and tlk as separate targets so they can be built and released independently.

## Asset pipeline

```
Meshy / Sloyd (concept mesh)
  → Blender 4.0 import (FBX or OBJ)
  → Cleanup, retopo, UV, materials
  → NeverBlender 4.1.0 export
  → .mdl + walkmesh (.pwk / .wok / .dwk)
  → art/exports/
  → packed into starter_art.hak
```

Use AI mesh tools only as upstream concept or blockout sources. Shipping assets still need Blender cleanup, NWN material constraints, collision, walkmesh validation, and packaging review.

Texture authoring: keep editable masters in source-art formats, export 24-bit uncompressed TGA for broad compatibility, DDS selectively for size/load optimization.

## Custom content packaging

- Ship module-specific content in **haks**, not `override/`.
- Custom placeables: model + textures + walkmesh (`.pwk`/`.wok`) + `placeables.2da` row + blueprint.
- Custom creatures: model + textures + `appearance.2da` row + blueprint; add `portraits.2da` if needed.
- Conflicting 2DAs must be merged into a single master top-priority hak early — not deferred.
- Treat conflicting 2DA edits as a merge problem early; maintain a master top-priority 2DA when multiple content packs touch the same table.

## Automation and CI

A minimal CI pipeline should:

1. Validate required tool versions match the repo policy.
2. Run `nasher pack` or `nasher install` for the release targets.
3. Archive `.mod`, `.hak`, `.tlk`, and release notes as artifacts.
4. Optionally launch a headless `nwserver` smoke test with a small validation module.

NWN module CI should prioritize repeatability over complexity.

## Credits and licensing

Document all third-party asset sources in `docs/` before any public release. Check license terms on each Neverwinter Vault asset used. Keep AI-generated mesh sources separated from hand-authored work in attribution notes.

## Community resources

- [Nasher](https://github.com/squattingmonk/nasher.nim) — build tool documentation
- [neverwinter.nim](https://github.com/niv/neverwinter.nim) — CLI utilities
- [NeverBlender (Vault)](https://neverwintervault.org) — Blender MDL bridge
- [NWN Lexicon](https://nwnlexicon.com) — NWScript function reference
- [Neverwinter Vault](https://neverwintervault.org) — community hub
- [Beamdog Forums](https://forums.beamdog.com) — official modding forums

## Starter checklist

- [ ] Choose and document the exact NWN:EE storefront and build.
- [ ] Install and verify Nasher, neverwinter.nim, NWNT, and Git.
- [ ] Set `NWN_ROOT` and `NWN_HOME` for each contributor.
- [ ] Install Blender 4.0.0 and NeverBlender 4.1.0 for art contributors.
- [ ] Create a seed module in the Aurora Toolset.
- [ ] Convert the seed module into a Nasher project with `nasher init` and `nasher unpack`.
- [ ] Validate `.gitignore` excludes local paths and generated outputs.
- [ ] Add a `CREDITS.md` or equivalent before accepting third-party assets.
- [ ] Build one vertical slice: one area, one script path, one dialog, one packaged custom content example.
