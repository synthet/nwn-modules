Compile NWScript and report structured diagnostics. Follow `.cursor/rules/nwscript.mdc`.

## Input

Optional file path after the command, e.g. `/compile src/scripts/inc_quests.nss`. If omitted, compile all changed scripts or all scripts.

## Steps

1. If file given: MCP `nwn.script.diagnostics` with `file` path
2. If no file: MCP `nwn.script.compile_all` or `bash tools/compile-scripts.sh`
3. On Windows with changed-only: `scripts/compile-scripts.ps1 -ChangedOnly`

Load env first on Windows: `. .\tools\env.ps1`

## Output format

```markdown
## Compile result
- Status: PASS/FAIL
- Files compiled: N

## Diagnostics
| File | Line | Severity | Message |
|------|------|----------|---------|
| ... | ... | error | ... |

## Fixes applied (if any)
- ...
```

Fix compile errors when the cause is clear.
