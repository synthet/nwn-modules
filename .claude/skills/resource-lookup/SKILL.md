---
name: resource-lookup
description: Find a resref in the Nasher src/ tree. Use when user says /resource-lookup.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Find a resref in the Nasher source tree.

## Input

Resref name in $ARGUMENTS, e.g. `/resource-lookup plc_start_chest`.

## Steps

1. MCP `nwn.nasher.resource_lookup` — preferred
2. Fallback: search `src/` case-insensitively

## Output format

```markdown
## Resref: <name>
- Found: yes/no
- Locations: ...
```

Report duplicate resrefs as warnings.
