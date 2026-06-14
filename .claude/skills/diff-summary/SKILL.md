---
name: diff-summary
description: Summarize git diff grouped by NWN concept (scripts, dialogs, areas). Use when user says /diff-summary.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Summarize git changes grouped by NWN concept.

## Input

Optional `staged` in $ARGUMENTS to diff `--cached`.

## Steps

1. MCP `nwn.project.diff_summary` — preferred
2. Fallback: `git diff --name-only` and group by path prefix

## Output format

```markdown
## Diff summary
- Total files: N

### scripts (N)
- path

### other (N)
- ...
```

Highlight risky changes (migrations, module.ifo, bootstrap chain).
