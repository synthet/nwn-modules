# NWN:EE Module MCP Server

The MCP (Model Context Protocol) server exposes NWN module development tooling
as structured tools that AI coding assistants (Claude, Cursor, Codex, etc.) can
call during a session. Instead of asking the assistant to manually construct
`nasher pack` invocations or scan for a resref by hand, it calls a named tool
with typed inputs and gets a structured result back.

## What the MCP server does

- Inspects and validates the project layout (nasher.cfg, src/ structure).
- Runs `nasher pack` to build module, hak, or tlk targets.
- Compiles NWScript with nwnsc and returns structured diagnostics.
- Searches docs/ for a query string and returns excerpts.
- Creates ADR (Architecture Decision Record) files in docs/ADR/.
- Stubs (scaffolded, not yet implemented): NWNX server control, asset indexing.

## What it does NOT do

- Execute arbitrary shell commands — only whitelisted, pre-defined invocations.
- Write to the NWN user directory unless `allowInstallToNwnUserDir` is `true`.
- Start an NWNX server unless `allowStartServer` is `true`.

## Installation

```bash
cd tools/mcp/nwn-project-mcp
npm install
npm run build
```

Node.js 20+ is required.

## Configuration

Copy `.env.example` to `.env` and fill in your paths:

```bash
cp tools/mcp/nwn-project-mcp/.env.example tools/mcp/nwn-project-mcp/.env
```

The server also reads `nwn-mcp.config.json` (at the repo root or inside
`tools/mcp/nwn-project-mcp/`). Edit paths and permissions there.

## Example MCP client configs

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "nwn-project": {
      "command": "node",
      "args": ["/absolute/path/to/nwn-modules/tools/mcp/nwn-project-mcp/dist/index.js"],
      "env": {
        "NWN_ROOT": "/path/to/NeverwinterNights/NWN"
      }
    }
  }
}
```

### Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "nwn-project": {
      "command": "node",
      "args": ["tools/mcp/nwn-project-mcp/dist/index.js"]
    }
  }
}
```

### Codex / OpenAI (`.openai/mcp_config.json`)

```json
{
  "servers": [
    {
      "name": "nwn-project",
      "transport": "stdio",
      "command": "node",
      "args": ["tools/mcp/nwn-project-mcp/dist/index.js"]
    }
  ]
}
```

## Tool list

### MVP (fully implemented)

| Tool | Description |
|------|-------------|
| `nwn.project.inspect` | Detect project structure, file counts, tool configs |
| `nwn.project.validate_layout` | Check required folders and config files |
| `nwn.project.diff_summary` | Summarise git diff grouped by NWN concept |
| `nwn.project.create_feature_branch` | Create a `feature/<name>` branch |
| `nwn.nasher.build` | Run `nasher pack <target>` |
| `nwn.nasher.validate` | Validate source JSON and project structure |
| `nwn.nasher.clean` | Remove build/ artifacts |
| `nwn.nasher.resource_lookup` | Search for a resref in src/ |
| `nwn.script.compile` | Compile a single .nss file via nwnsc |
| `nwn.script.compile_all` | Compile all .nss files, return aggregate diagnostics |
| `nwn.script.find_symbol` | Grep for a function/constant/include in .nss files |
| `nwn.script.diagnostics` | Compile and return structured diagnostics |
| `nwn.docs.search` | Search docs/ for a query string |
| `nwn.docs.add_decision` | Create an ADR file in docs/ADR/ |
| `nwn.aurora.launch` | Launch Aurora Toolset (if configured) |
| `nwn.aurora.snapshot` | Copy .mod to build/snapshots/<timestamp>-<label>.mod |

### Scaffolded (returns "not yet implemented")

| Tool | Notes |
|------|-------|
| `nwn.aurora.watch_changes` | Planned: watch Aurora save events |
| `nwn.aurora.import_after_save` | Planned: auto-import on toolset save |
| `nwn.nwnx.*` | NWNX server management |
| `nwn.assets.*` | Asset indexing and attribution audit |

## Permission tiers

| Tier | Tools | Config key |
|------|-------|-----------|
| Read-only | `inspect`, `validate_layout`, `diff_summary`, `find_symbol`, `docs.search`, `resource_lookup` | always allowed |
| Workspace-write | `create_feature_branch`, `nasher.build`, `nasher.clean`, `docs.add_decision`, `aurora.snapshot` | always allowed |
| Dangerous | `aurora.launch`, any `nwnx.*`, install to NWN_HOME | `allowAuroraLaunch`, `allowInstallToNwnUserDir`, `allowStartServer` |

## Security model

- All file paths are validated with `safePath()` to prevent path traversal.
- Only pre-defined commands are executed; no `exec(userInput)` patterns.
- Shell injection is prevented by passing args as arrays (never string concatenation).
- The `allowDeleteFiles` permission gate prevents `nasher.clean` without explicit opt-in.

## Adding a new tool

1. Add a new file under `src/tools/` (or add to an existing one).
2. Export a `register<Category>Tools(server, config)` function.
3. Import and call it in `src/index.ts`.
4. Add the tool to this README's tool list.
