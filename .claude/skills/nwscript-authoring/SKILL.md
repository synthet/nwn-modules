---
name: nwscript-authoring
description: NWScript event chain, prefix conventions, and compile workflow for NWN:EE module scripts. Use when writing or editing .nss files, event hooks, or includes.
user-invocable: false
---

# NWScript authoring

## Event chain

```
mod_on_load.nss  → evt_module.nss  → inc_bootstrap.nss
evt_on_enter.nss → evt_client.nss  (Login, Validation, Quest, Faction)
evt_on_leave.nss → evt_client.nss  (Session_Save, Audit)
evt_on_death.nss / evt_on_respawn.nss
```

Module event scripts are set in `src/module/module.ifo.json` and may be reassigned at runtime by bootstrap.

## Prefix conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `inc_*` | Libraries | `inc_bootstrap.nss`, `inc_quests.nss` |
| `db_*` | DB repositories | `db_session.nss` |
| `sys_*` | Gameplay systems | `sys_login.nss`, `sys_registry.nss` |
| `evt_*` | Event dispatchers | `evt_module.nss`, `evt_client.nss` |
| `qst_*` | Quest logic | — |
| `adm_*` | Admin commands | — |
| `plc_*` / `cre_*` / `trg_*` | Object scripts | `plc_start_chest.nss` |

## Includes

- Root scripts: `#include "inc_foo"` (no path)
- DB layer: `#include "inc_db_core"` from `src/scripts/include/db/`

## Compile loop

1. Edit `.nss` under `src/scripts/`
2. Compile: MCP `nwn.script.diagnostics` or `bash tools/compile-scripts.sh`
3. Fix file:line errors before commit
4. Output `.ncs` lands in `build/ncs/` (git-ignored)

## New script checklist

- [ ] Correct prefix for script role
- [ ] `#include` only what is needed
- [ ] Entry `void main()` or dispatcher function matches wiring
- [ ] Compiles clean with nwnsc
