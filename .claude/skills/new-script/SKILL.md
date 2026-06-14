---
name: new-script
description: Scaffold a new NWScript file with correct prefix and includes. Use when user says /new-script.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Grep, Glob
---

Scaffold a new NWScript file. Read skill `nwscript-authoring` for conventions.

## Input

Prefix and name in $ARGUMENTS, e.g. `/new-script sys merchant`.

Valid prefixes: `inc`, `db`, `sys`, `evt`, `qst`, `adm`, `plc`, `cre`, `trg`.

## Steps

1. Create `src/scripts/<prefix>_<name>.nss` with header and stub
2. Add matching `#include` lines
3. Compile with MCP `nwn.script.diagnostics`

## Output

Report file path, compile status, and wiring checklist (module.ifo, blueprint, evt dispatcher).
