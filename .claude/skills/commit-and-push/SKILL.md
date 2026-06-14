---
name: commit-and-push
description: Commit current work and push to remote following repo git safety rules. Use when user says commit and push or asks to save changes to git.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Commit and push following project git safety rules. See `.cursor/skills/commit-and-push/SKILL.md` for the full workflow.

## Steps

1. Run `git status`, `git diff`, and `git log -5 --oneline` in parallel
2. Stage relevant files; exclude `.env`, `docker/.env*`, build artifacts, and machine-local MCP config
3. If `nwn-mcp.config.json` is tracked, `git rm --cached` it
4. Commit with a 1–2 sentence message (why, not what) via HEREDOC
5. Run `git status` to verify
6. `git push -u origin HEAD` when the user asked to push

Never amend a failed hook commit. Never force-push to main.
