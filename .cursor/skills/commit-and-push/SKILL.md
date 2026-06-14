---
name: commit-and-push
description: >-
  Commit current work and push to remote following repo git safety rules.
  Use when the user asks to commit, push, commit and push, or save changes to git.
disable-model-invocation: true
---

# Commit and push

## Preconditions

- User explicitly asked to commit and/or push.
- Never commit unless asked.
- Never push unless asked.

## Git safety (mandatory)

- NEVER update git config
- NEVER run destructive commands (`push --force`, `reset --hard`, etc.) unless the user explicitly requests them
- NEVER skip hooks (`--no-verify`, `--no-gpg-sign`, etc.)
- NEVER force-push to `main`/`master` — warn the user if they request it
- Avoid `git commit --amend` unless ALL are true: user requested amend, HEAD commit was created in this session, commit not pushed
- NEVER commit secrets: `.env`, `docker/.env*`, credentials, or machine-local MCP config (`nwn-mcp.config.json`, `.cursor/mcp.json`)
- NEVER commit build artifacts: `*.mod`, `*.hak`, `*.tlk`, `*.ncs`, `*.erf`

## Workflow

### 1. Inspect (run in parallel)

```bash
git status
git diff
git log -5 --oneline
```

If pushing, also check upstream:

```bash
git status -sb
git rev-parse --abbrev-ref @{u} 2>/dev/null || true
```

### 2. Stage

Add only relevant tracked and untracked files. Exclude git-ignored secrets and artifacts.

If `nwn-mcp.config.json` is still tracked but now git-ignored, untrack without deleting:

```bash
git rm --cached nwn-mcp.config.json
```

### 3. Commit message

Draft 1–2 sentences focused on **why**, matching recent `git log` style. Pass via HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
Short summary sentence.

Optional second sentence with context.
EOF
)"
```

### 4. Verify commit

```bash
git status
```

If a pre-commit hook modifies files, fix and create a **new** commit (do not amend unless amend rules apply).

### 5. Push (only when requested)

```bash
git push -u origin HEAD
```

Use `-u` when the branch has no upstream. Do not push if the user only asked to commit.

## This repository

Machine-local paths belong in `.env`, `nwn-mcp.config.json`, and `.cursor/mcp.json` (all git-ignored). Committed templates: `.env.example`, `nwn-mcp.config.example.json`, `.cursor/mcp.json.example`.
