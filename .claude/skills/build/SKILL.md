---
name: build
description: Pack NWN module, art, tlk, or all via Nasher. Use when user says /build or asks to pack/build the module.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash
---

Pack NWN build artifacts with Nasher. Follow AGENTS.md constraints.

## Input

Optional target in $ARGUMENTS: `module` (default), `art`, `tlk`, or `all`.

## Steps

1. MCP `nwn.nasher.build` with `target` — preferred
2. Fallback: `bash tools/build.sh` or `bash tools/pack.sh` or `scripts/build-module.ps1`

Load env on Windows: `. .\tools\env.ps1`

## Output format

```markdown
## Build result
- Target: module/art/tlk/all
- Status: PASS/FAIL
- Output: build/dist/...
```

Do not commit generated `.mod`, `.hak`, or `.tlk` files.
