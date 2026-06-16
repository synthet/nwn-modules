---
type: Design Document
title: NWN Tools Directory Layout
description: External third-party Neverwinter Nights modding binary layout and PATH surface.
resource: docs/design/nwn-tools-layout.md
tags: [toolchain, nwn-tools, layout]
timestamp: 2026-06-16T00:00:00Z
---

# NWN Tools Directory Layout

External install root for third-party Neverwinter Nights modding binaries. On this workstation:

```
D:\Projects\nwn-tools
```

This directory lives **outside** the `nwn-modules` Git repository. The module repo references it through `NWN_TOOLS` in `.env`; `tools/env.sh` and `tools/env.ps1` prepend `NWN_TOOLS/bin` to `PATH`.

Pinned versions are recorded in `versions.txt` and must match [toolchain.md](toolchain.md).

## Top-level layout

```
nwn-tools/
├── README.md              # Install notes and high-level layout
├── versions.txt           # Pinned tool versions on this machine
├── bin/                   # Executables on PATH (primary runtime surface)
├── nim/
│   └── neverwinter-2.1.2/ # neverwinter.nim 2.1.2 release unpack (archive copy)
└── nwnt/
    └── 1.4.0/             # NWNT 1.4.0 release unpack (archive copy)
```

`nwnx/` is reserved for an optional NWNX:EE server build (Phase 2+). It is **not** present on this machine yet.

## `bin/` — executables on PATH

All build scripts, CI, and MCP tooling resolve commands from here after sourcing `tools/env.ps1` or `tools/env.sh`.

### Module build and NWScript

| File | Role |
|------|------|
| `nasher.exe` | Nasher 1.1.2 — packs/unpacks module, hak, and tlk targets from the `src/` tree |
| `nwn_script_comp.exe` | neverwinter.nim NWScript compiler (used by `tools/compile-scripts.sh` and CI) |

There is no `nwnsc.exe` in this install. Scripts that accept either `nwn_script_comp` or `nwnsc` will use `nwn_script_comp` from `bin/`.

### NWSync

| File | Role |
|------|------|
| `nwn_nwsync_write.exe` | Generate a versioned NWSync manifest and content tree (`tools/nwsync-release.sh`) |
| `nwn_nwsync_fetch.exe` | Fetch NWSync content from a remote manifest |
| `nwn_nwsync_print.exe` | Inspect or print NWSync manifest metadata |
| `nwn_nwsync_prune.exe` | Prune stale entries from an NWSync store |

### Resource and archive utilities (neverwinter.nim)

| File | Role |
|------|------|
| `nwn_erf.exe` | Read/write ERF archives |
| `nwn_erf_tlkify.exe` | Embed or extract TLK data in ERF contexts |
| `nwn_gff.exe` | Read/write GFF (Generic File Format) structures |
| `nwn_key_pack.exe` | Pack resources into a KEY/BIF or hak keyfile |
| `nwn_key_unpack.exe` | Unpack a keyfile into constituent resources |
| `nwn_key_shadows.exe` | Manage shadowed keyfile entries |
| `nwn_key_transparent.exe` | Transparent keyfile overlay operations |
| `nwn_resman_cat.exe` | Concatenate or list managed resources |
| `nwn_resman_diff.exe` | Diff two resource trees or manifests |
| `nwn_resman_extract.exe` | Extract resources from archives or keyfiles |
| `nwn_resman_grep.exe` | Search resource contents by pattern |
| `nwn_resman_pkg.exe` | Package a resource tree for distribution |
| `nwn_resman_stats.exe` | Summarize resource inventory statistics |
| `nwn_tlk.exe` | Read/write talk table (TLK) files |
| `nwn_twoda.exe` | Read/write 2DA rule tables |
| `nwn_ssf.exe` | Read/write sound set (SSF) files |
| `nwn_compressedbuf.exe` | Compress or decompress NWN buffer payloads |
| `nwn_asm.exe` | Low-level NWScript bytecode utilities |
| `nwn_net.exe` | Network/protocol helpers for NWN tooling |

### NWNT bridge

| File | Role |
|------|------|
| `nwn_nwnt.exe` | NWNT 1.4.0 GFF helper; also copied into `bin/` from the `nwnt/` release |

### Runtime dependencies (do not remove)

| File | Role |
|------|------|
| `libnwnscriptcomp.dll` | NWScript compiler runtime |
| `libcrypto-1_1-x64.dll` | OpenSSL crypto (HTTPS / checksum operations) |
| `libssl-1_1-x64.dll` | OpenSSL TLS |
| `pcre64.dll` | Perl-compatible regex engine |
| `pdcurses64.dll` | Terminal UI for interactive CLI tools |
| `sqlite3_64.dll` | SQLite backing store for resource tooling |
| `cacert.pem` | CA bundle for HTTPS fetches |
| `.gitkeep` | Placeholder so an empty `bin/` can exist in version control of `nwn-tools` itself |

## `nim/neverwinter-2.1.2/` — neverwinter.nim archive copy

Unpacked neverwinter.nim **2.1.2** (x86_64-windows) release. Mirrors most `bin/` executables and their DLLs, plus SDK headers:

```
nim/neverwinter-2.1.2/
├── nwnscriptcomp.h          # NWScript compiler C API header
├── nwn_*.exe                # Same neverwinter.nim CLI tools as bin/ (except nasher, nwn_nwnt)
├── libnwnscriptcomp.dll
├── libcrypto-1_1-x64.dll
├── libssl-1_1-x64.dll
├── pcre64.dll
├── pdcurses64.dll
├── sqlite3_64.dll
└── cacert.pem
```

`bin/` is the active runtime surface. The `nim/` subtree is the versioned source-of-truth unpack used when refreshing `bin/` after a toolchain upgrade.

## `nwnt/1.4.0/` — NWNT archive copy

Unpacked NWNT **1.4.0** (windows) release:

```
nwnt/1.4.0/
└── nwn_nwnt.exe
```

The same binary is also present in `bin/nwn_nwnt.exe` for PATH convenience.

## `versions.txt`

Records what is installed on this machine:

```
neverwinter.nim 2.1.2 (x86_64-windows)
nasher 1.1.2 (windows)
nwnt 1.4.0 (windows)
```

Update this file whenever a toolchain component is upgraded.

## Environment wiring

In `nwn-modules/.env`:

```dotenv
NWN_TOOLS=D:/Projects/nwn-tools
```

Load before building or compiling:

```powershell
. .\tools\env.ps1
```

```sh
source tools/env.sh
```

## Relationship to the game install

| Variable | Purpose | This machine |
|----------|---------|--------------|
| `NWN_TOOLS` | Third-party modding binaries (this directory) | `D:/Projects/nwn-tools` |
| `NWN_ROOT` | NWN:EE game install (Aurora Toolset, base `data/`) | `D:/SteamLibrary/steamapps/common/Neverwinter Nights` |
| `NWN_HOME` | User folder (`modules/`, `hak/`, `override/`) | `C:/Users/dmnsy/Documents/Neverwinter Nights` |

`NWN_TOOLS` does not contain game assets or the Aurora Toolset. Those live under `NWN_ROOT`.
