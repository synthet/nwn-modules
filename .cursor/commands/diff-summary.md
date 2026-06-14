Summarize git changes grouped by NWN concept. See AGENTS.md.

## Input

Optional: `staged` to diff `--cached` instead of working tree vs HEAD.

## Steps

1. MCP `nwn.project.diff_summary` with `staged: true/false` — preferred
2. Fallback: `git diff --name-only HEAD` (or `--cached`) and group manually:
   - `scripts` — `src/scripts/**`
   - `dialogs` — `src/dialogs/**`
   - `areas` — `src/areas/**`
   - `blueprints` — `src/blueprints/**`
   - `module` — `src/module/**`
   - `2da` / `tlk` — `src/2da/**`, `src/tlk/**`
   - `database` — `database/**`
   - `other` — everything else

## Output format

```markdown
## Diff summary
- Total files: N

### scripts (N)
- path/to/file

### dialogs (N)
- ...

### other (N)
- ...
```

Highlight risky changes (migrations, module.ifo, bootstrap chain).
