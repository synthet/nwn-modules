Find a resref in the Nasher source tree.

## Input

Resref name after the command, e.g. `/resource-lookup plc_start_chest`.

## Steps

1. MCP `nwn.nasher.resource_lookup` with `resref` — preferred
2. Fallback: search `src/` case-insensitively for the resref string

## Output format

```markdown
## Resref: <name>
- Found: yes/no
- Locations:
  - path/to/file (context)
```

Report duplicate resrefs as warnings.
