# AI assistant setup

Configure Cursor and Claude Code to work with this NWN:EE module project, including the **nwn-project** MCP server.

## Prerequisites

- Node.js 20+
- NWN:EE installed (build 89.8193.37)
- neverwinter.nim tools on PATH (`nwnsc` or `nwn_script_comp`, Nasher)
- Repo `.env` with `NWN_TOOLS`, `NWN_ROOT`, `NWN_HOME` (copy from `.env.example`)

## 1. Build the MCP server

```bash
cd tools/mcp/nwn-project-mcp
npm install
npm run build
npm test
```

The server entry point is `tools/mcp/nwn-project-mcp/dist/index.js`.

## 2. Local config files (not committed)

Copy each example to its local override:

| Example | Local file | Purpose |
|---------|------------|---------|
| `nwn-mcp.config.example.json` | `nwn-mcp.config.json` | Tool paths, permissions |
| `.cursor/mcp.json.example` | `.cursor/mcp.json` | Cursor MCP connection |
| `tools/mcp/nwn-project-mcp/.env.example` | `tools/mcp/nwn-project-mcp/.env` | `NWN_ROOT`, compiler paths |
| `config/ai/claude-code.mcp.json.example` | `.claude/settings.json` | Claude Code MCP connection |

### nwn-mcp.config.json

```bash
cp nwn-mcp.config.example.json nwn-mcp.config.json
```

Edit locally:

- `tools.auroraToolset.command` — path to `nwtoolset.exe` (Windows only)
- `permissions.allowAuroraLaunch` — set `true` only if you want MCP to launch Aurora

### .cursor/mcp.json (Cursor)

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Set `NWN_ROOT` to your NWN:EE install directory. On Windows, set `command` to the full path of `node.exe` (Cursor's MCP host often lacks shell `PATH` — `spawn node ENOENT` otherwise). Restart Cursor or toggle the server in **Settings → Tools & MCP**.

### Claude Code

Merge `config/ai/claude-code.mcp.json.example` into your project `.claude/settings.json` or user MCP config. Use repo-relative paths when running from the project root.

### Claude Desktop

Merge `config/ai/claude-desktop.mcp.json.example` into:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Use **absolute paths** for `args` and `env` values.

## 3. Windows (PowerShell)

```powershell
# From repo root
cp nwn-mcp.config.example.json nwn-mcp.config.json
cp .cursor\mcp.json.example .cursor\mcp.json
cp tools\mcp\nwn-project-mcp\.env.example tools\mcp\nwn-project-mcp\.env

# Load tool paths
. .\tools\env.ps1

# Edit nwn-mcp.config.json — set auroraToolset.command, e.g.:
# "C:/SteamLibrary/steamapps/common/Neverwinter Nights/bin/win32/nwtoolset.exe"

# Edit .cursor/mcp.json — set NWN_ROOT, e.g.:
# "D:/SteamLibrary/steamapps/common/Neverwinter Nights"

# Build MCP server
cd tools\mcp\nwn-project-mcp
npm install
npm run build
```

## 4. Linux / macOS

```bash
cp nwn-mcp.config.example.json nwn-mcp.config.json
cp .cursor/mcp.json.example .cursor/mcp.json
cp tools/mcp/nwn-project-mcp/.env.example tools/mcp/nwn-project-mcp/.env

source tools/env.sh

cd tools/mcp/nwn-project-mcp && npm install && npm run build
```

## 5. Verify connection

After restarting your IDE:

1. Confirm **nwn-project** appears in MCP settings (green / connected).
2. Ask the agent to call `nwn.project.inspect` — should return script/area counts.
3. Run `/validate` slash command to exercise the full check loop.

## 6. Slash commands and skills

| IDE | Slash commands | Background skills | Rules |
|-----|----------------|-------------------|-------|
| Cursor | `.cursor/commands/` | `.cursor/skills/` | `.cursor/rules/` |
| Claude Code | `.claude/skills/` (`user-invocable: true`) | `.claude/skills/` (`user-invocable: false`) | `AGENTS.md`, `CLAUDE.md` |

See [AGENTS.md](../../AGENTS.md) for the command index.

## 7. Permission tiers

Dangerous MCP operations are gated in `nwn-mcp.config.json`:

| Flag | Default | Controls |
|------|---------|----------|
| `allowDeleteFiles` | `false` | `nwn.nasher.clean` |
| `allowAuroraLaunch` | `false` | `nwn.aurora.launch` |
| `allowStartServer` | `false` | `nwn.nwnx.start_server` |
| `allowInstallToNwnUserDir` | `false` | Install to NWN_HOME |

## 8. Canonical MCP package

Use **`tools/mcp/nwn-project-mcp`** (CI-built). The older `tools/mcp/nwn-mcp` package has extra NWNX stubs but is not the default client target.

Full tool reference: [docs/mcp-tools.md](../../docs/mcp-tools.md)
