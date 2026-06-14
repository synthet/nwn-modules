Pack NWN build artifacts with Nasher. Follow `.cursor/rules/nwn-core.mdc`.

## Input

Optional target after the command: `module` (default), `art`, `tlk`, or `all`.

## Steps

1. MCP `nwn.nasher.build` with `target` — preferred
2. Fallback:
   - `module`: `bash tools/build.sh` or `scripts/build-module.ps1 -Target module`
   - `all`: `bash tools/pack.sh` or `scripts/build-module.ps1 -Target all`

Load env on Windows: `. .\tools\env.ps1`

## Output format

```markdown
## Build result
- Target: module/art/tlk/all
- Status: PASS/FAIL
- Output: build/dist/...

## Errors (if any)
- ...
```

Do not commit generated `.mod`, `.hak`, or `.tlk` files.
