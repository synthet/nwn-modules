Commit current work and push to `origin` following repo git safety rules.

## Steps

1. Run `git status`, `git diff`, and `git log -5 --oneline` in parallel
2. Stage relevant files only — never `.env`, `docker/.env*`, build artifacts, or machine-local `nwn-mcp.config.json` / `.cursor/mcp.json`
3. Untrack `nwn-mcp.config.json` with `git rm --cached` if it is still indexed
4. Write a 1–2 sentence commit message focused on why; commit via HEREDOC
5. Verify with `git status`
6. `git push -u origin HEAD`

Do not amend failed hook commits. Do not force-push to main.
