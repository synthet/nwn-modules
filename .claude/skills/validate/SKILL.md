---
name: validate
description: Run full NWN validation loop (layout, JSON, compile-all). Use when user says /validate or asks to validate the project.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Run the full NWN project validation loop. Follow AGENTS.md and CLAUDE.md.

## Steps

1. **Layout** — MCP `nwn.project.validate_layout` or `bash tools/smoke-test.sh`
2. **JSON** — validate all `src/**/*.json` with `python3 -m json.tool`; or MCP `nwn.nasher.validate`
3. **Compile** — MCP `nwn.script.compile_all` or `bash tools/compile-scripts.sh`

Prefer MCP tools when **nwn-project** is connected; otherwise use shell fallbacks. On Windows: `. .\tools\env.ps1` first.

## Output format

```markdown
## Validation summary
- Layout: PASS/FAIL
- JSON: PASS/FAIL (N files checked)
- Compile: PASS/FAIL (N errors, M warnings)

## Failures (if any)
- [file:line] message

## Next steps
- ...
```

Fix straightforward failures before reporting done.
