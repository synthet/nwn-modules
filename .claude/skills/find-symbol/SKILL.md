---
name: find-symbol
description: Search NWScript for functions, constants, or includes. Use when user says /find-symbol.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Search NWScript for a function, constant, or include.

## Input

Symbol name in $ARGUMENTS, e.g. `/find-symbol Bootstrap_Init`.

## Steps

1. MCP `nwn.script.find_symbol` — preferred
2. Fallback: search `src/scripts/**/*.nss`

## Output format

```markdown
## Symbol: <name>
- Matches: N
| File | Line | Context |
```
