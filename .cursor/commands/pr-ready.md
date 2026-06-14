Prepare the current branch for pull request. Mirrors CI validate job in `.github/workflows/ci.yml`.

## Steps

1. Run `/validate` workflow (layout, JSON, compile)
2. MCP `nwn.project.diff_summary` — summarize changes
3. Fix straightforward failures (JSON syntax, obvious compile errors, smoke-test paths)
4. Do not commit build artifacts or secrets
5. Draft PR title and body

## CI checks to mirror

- JSON validate all `src/**/*.json`
- `tools/smoke-test.sh`
- `tools/compile-scripts.sh` (when nwnsc available)

## Output format

```markdown
## PR readiness
- Validation: PASS/FAIL
- Branch: <name>
- Commits ahead of main: N

## Changes summary
(bullet list by NWN concept)

## Suggested PR title
...

## Suggested PR body
### Summary
- ...

### Test plan
- [ ] ...
```

Do not push or open the PR unless the user asks.
