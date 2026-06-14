# Neverwinter Nights: Enhanced Edition Aurora Module Starter

This repository is a starter planning baseline for a source-controlled Neverwinter Nights: Enhanced Edition module project. It treats the Aurora Toolset as the authoring UI, while Git and Nasher own the reviewable project source and repeatable build process.

## Recommended 2026 toolchain

| Component | Recommended baseline | Notes |
|---|---:|---|
| Neverwinter Nights: Enhanced Edition | `89.8193.37` stable line | Pin one exact storefront/build for the whole team and record it in release notes. |
| Aurora Toolset | Bundled with pinned NWN:EE install | Canonical editor for areas, blueprints, conversations, journals, and module properties. |
| Nasher | `1.1.2` | Source-controlled build orchestration for modules, haks, erfs, tlks, and round-trip unpack/install workflows. |
| neverwinter.nim | `2.1.2` | Modern open-source NWN CLI tooling and script compiler used by current Nasher workflows. |
| NWNT | `1.4.0` | Useful compatibility/conversion helper in many Nasher-era workflows. |
| Git | `2.54.0` | Team collaboration and reproducible history. |
| Blender | `4.0.0` | Safer production pin for NeverBlender compatibility than the latest Blender release. |
| NeverBlender | `4.1.0` | NWN MDL import/export, walkmesh classes, and EE material support. |
| GIMP | `3.2.4` | Cross-platform texture editing and TGA authoring. |
| NVIDIA Texture Tools Exporter | `2024.1.1` | Optional DDS export/compression support. |

The two most important pins are the NWN:EE build line and the Blender/NeverBlender pairing. Do not let contributors drift to different game builds or art tooling without documenting and testing the change.

## Project principles

1. Use the Aurora Toolset for visual/module authoring.
2. Use Nasher for unpacking, building, installing, and packaging project assets.
3. Keep reviewable source in Git instead of treating generated `.mod`, `.hak`, or `.tlk` files as the source of truth.
4. Package reusable custom content into haks and tlks rather than asking players or testers to install loose override files.
5. Keep personal paths, local user settings, and generated install artifacts out of version control.
6. Document third-party asset permissions before the first public beta.

## Suggested repository layout

```text
nwn-modules/
├─ README.md
├─ .gitignore
├─ nasher.cfg
├─ docs/
│  ├─ design/
│  └─ release-notes/
├─ src/
│  ├─ module/
│  │  └─ module.ifo.json
│  ├─ areas/
│  │  ├─ start_area.are.json
│  │  ├─ start_area.git.json
│  │  └─ start_area.gic.json
│  ├─ scripts/
│  │  ├─ mod_on_client_enter.nss
│  │  ├─ mod_on_load.nss
│  │  └─ plc_start_chest.nss
│  ├─ blueprints/
│  │  ├─ plc_start_chest.utp.json
│  │  └─ npc_guide.utc.json
│  ├─ dialogs/
│  │  └─ npc_guide.dlg.json
│  ├─ 2da/
│  │  ├─ placeables.2da
│  │  ├─ appearance.2da
│  │  └─ portraits.2da
│  └─ tlk/
│     └─ project_en.tlk.json
├─ art/
│  ├─ blender/
│  ├─ textures/
│  └─ exports/
├─ build/
│  └─ dist/
└─ tools/
```

Generated release artifacts should be reproducible from source and stored under release artifacts, not reviewed as normal development changes.

## Nasher workflow

A practical day-to-day loop is:

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

### Starter `nasher.cfg` shape

```ini
[package]
name = "Starter Module"
description = "Minimal NWN:EE/Aurora starter project"
version = "0.1.0"
file = "$target.hak"
default = "module"

  [package.sources]
  include = "src/**/*.{nss,json,2da}"
  include = "src/tlk/*.json"

  [package.rules]
  "*" = "src"

[target]
name = "module"
file = "starter_module.mod"
modName = "Starter Module"
modMinGameVersion = "89.8193.37"

[target]
name = "art"
group = "haks"
file = "starter_art.hak"
description = "Custom models, textures, 2DAs, placeables"

  [target.sources]
  include = "src/2da/*"
  include = "art/exports/*"

[target]
name = "tlk"
file = "starter_project.tlk"
description = "Custom talk table"

  [target.sources]
  include = "src/tlk/*.json"
```

## Asset pipeline

Recommended model flow:

```text
AI concept mesh or source mesh
→ Blender FBX/OBJ import
→ cleanup, retopo, UV, and material simplification
→ NeverBlender export
→ MDL plus walkmesh files
→ hak packaging with textures and 2DA rows
→ Aurora Toolset and in-game validation
```

Use AI mesh tools only as upstream concept or blockout sources. Shipping assets still need Blender cleanup, NWN material constraints, collision, walkmesh validation, and packaging review.

For textures, keep editable masters in source-art formats and export game-ready derivatives. Use 24-bit uncompressed TGA for broad compatibility and DDS selectively when compression or loading behavior is worth the added pipeline step.

## Custom content packaging guidance

- Prefer haks for module-specific custom models, textures, 2DAs, portraits, and other reusable resources.
- Avoid using `override` for project content unless debugging a very specific local issue.
- Treat conflicting 2DA edits as a merge problem early; maintain a master top-priority 2DA when multiple content packs touch the same table.
- For custom placeables, package the model, textures, `.pwk` or relevant walkmesh, `placeables.2da` row, and blueprint import path together.
- For custom creatures, expect `appearance.2da` work; add `portraits.2da` if custom portraits are needed.

## Automation and CI

A minimal CI pipeline should:

1. Validate required tool versions.
2. Run the appropriate Nasher build target.
3. Archive `.mod`, `.hak`, `.tlk`, and release notes as artifacts.
4. Optionally launch a headless `nwserver` smoke test with a small validation module.

NWN module CI should prioritize repeatability over complexity.

## Starter checklist

- [ ] Choose and document the exact NWN:EE storefront and build.
- [ ] Install and verify Nasher, neverwinter.nim, NWNT, and Git.
- [ ] Set `NWN_ROOT` and `NWN_HOME` for each contributor.
- [ ] Install Blender 4.0.0 and NeverBlender 4.1.0 for art contributors.
- [ ] Create a seed module in the Aurora Toolset.
- [ ] Convert the seed module into a Nasher project with `init` and `unpack`.
- [ ] Add `.gitignore` rules for local paths and generated outputs.
- [ ] Add a `CREDITS.md` or equivalent before accepting third-party assets.
- [ ] Build one vertical slice with one area, one script path, one dialog or blueprint, and one packaged custom content example.
