---
name: pr-ready
description: Run CI-equivalent checks and draft PR summary. Use when user says /pr-ready.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Prepare the branch for pull request. Mirrors `.github/workflows/ci.yml` validate job.

## Steps

1. Run validation (layout, JSON, compile) — same as `/validate`
2. MCP `nwn.project.diff_summary`
3. Fix straightforward failures
4. Draft PR title and body

Do not push or open PR unless user asks.

## Output

PR readiness status, changes summary, suggested title and body with test plan.
