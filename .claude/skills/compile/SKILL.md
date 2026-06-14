---
name: compile
description: Compile NWScript and report file-line diagnostics. Use when user says /compile or asks to compile .nss files.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Compile NWScript and report structured diagnostics. Follow AGENTS.md NWScript conventions.

## Input

Optional file path in $ARGUMENTS, e.g. `/compile src/scripts/inc_quests.nss`. If omitted, compile all scripts.

## Steps

1. If file given: MCP `nwn.script.diagnostics` with `file` path
2. If no file: MCP `nwn.script.compile_all` or `bash tools/compile-scripts.sh`
3. On Windows: `scripts/compile-scripts.ps1`

Load env on Windows: `. .\tools\env.ps1`

## Output format

```markdown
## Compile result
- Status: PASS/FAIL
- Files compiled: N

## Diagnostics
| File | Line | Severity | Message |
|------|------|----------|---------|
| ... | ... | error | ... |
```

Fix compile errors when the cause is clear.
