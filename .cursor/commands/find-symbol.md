Search NWScript for a function, constant, or include. Follow `.cursor/rules/nwscript.mdc`.

## Input

Symbol name or pattern after the command, e.g. `/find-symbol Bootstrap_Init` or `/find-symbol inc_db_core include`.

## Steps

1. MCP `nwn.script.find_symbol` with `symbol` and optional `type` (`function`, `constant`, `include`, `any`)
2. Fallback: `rg` or `grep` in `src/scripts/**/*.nss`

## Output format

```markdown
## Symbol: <name>
- Type: function/constant/include
- Matches: N

| File | Line | Context |
|------|------|---------|
| ... | ... | ... |
```
