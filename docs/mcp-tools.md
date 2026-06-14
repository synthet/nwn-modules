# NWN Project MCP Server

The MCP (Model Context Protocol) server exposes NWN:EE module development
tooling as structured tools callable by AI coding assistants. Instead of
manually constructing shell invocations, the assistant calls a named tool with
typed inputs and gets a structured JSON result.

## Why does this exist?

- Provide a safe, auditable interface between an AI assistant and the build
  toolchain.
- Replace ad-hoc shell commands with typed, permission-gated tool calls.
- Give the assistant structured diagnostics (file:line:col) rather than raw
  terminal output.
- Enable future automation: CI-triggered script compilation, lint-on-save,
  ADR creation.

---

## Installation

Requires Node.js 20+.

```bash
cd tools/mcp/nwn-project-mcp
npm install
npm run build
```

To verify the build:

```bash
node dist/index.js --help 2>&1 | head
```

---

## Configuration

### nwn-mcp.config.json

Copy from the committed example:

```bash
cp nwn-mcp.config.example.json nwn-mcp.config.json
```

The server reads `nwn-mcp.config.json` from the repo root (or
`tools/mcp/nwn-project-mcp/`). Edit tool commands and paths locally — this file is git-ignored.

```json
{
  "workspaceRoot": ".",
  "tools": {
    "nasher": { "command": "nasher" },
    "nwscriptCompiler": { "command": "nwnsc" },
    "auroraToolset": { "command": "" },
    "nwnx": { "root": "./external/nwnx", "serverCommand": "" }
  },
  "paths": {
    "moduleSource": "src/module",
    "scripts": "src/scripts",
    "docs": "docs",
    "hakSource": "src/2da",
    "dist": "build/dist",
    "build": "build"
  },
  "permissions": {
    "allowInstallToNwnUserDir": false,
    "allowStartServer": false,
    "allowAuroraLaunch": true,
    "allowDeleteFiles": false
  }
}
```

### .env

Copy `.env.example` to `.env` and set your paths:

```bash
cp tools/mcp/nwn-project-mcp/.env.example tools/mcp/nwn-project-mcp/.env
```

At minimum, set `NWN_ROOT` for nwnsc to find base game data:

```
NWN_ROOT=/path/to/NeverwinterNights/NWN
```

---

## Example MCP client configs

### Claude Desktop

File: `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

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

### Cursor

Copy the project example to a local override (git-ignored):

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

File: `.cursor/mcp.json` (project-scoped) or `~/.cursor/mcp.json` (global).
Project-level config overrides global when the same server name is defined.

```json
{
  "mcpServers": {
    "nwn-project": {
      "command": "node",
      "args": ["tools/mcp/nwn-project-mcp/dist/index.js"],
      "env": {
        "NWN_ROOT": "/path/to/NeverwinterNights/NWN",
        "NWN_MCP_CONFIG": "nwn-mcp.config.json"
      }
    }
  }
}
```

See [config/ai/README.md](../config/ai/README.md) for full setup.

### Claude Code

Merge `config/ai/claude-code.mcp.json.example` into your project `.claude/settings.json`
or user MCP config. Use repo-relative paths when running from the project root.

### Claude Desktop

Use `config/ai/claude-desktop.mcp.json.example` — absolute paths required.
Merge into `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or
`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

### Codex / OpenAI

File: `.openai/mcp_config.json`

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

---

## Tool reference

### `nwn.project.inspect`

Detect and return project structure.

**Inputs:** none

**Output:**
```json
{
  "workspaceRoot": "/abs/path",
  "nasherCfg": true,
  "mcpConfig": true,
  "counts": { "scripts": 4, "areas": 2, "dialogs": 1, "blueprints": 5 },
  "toolConfig": { "nasherCommand": "nasher", ... },
  "permissions": { ... }
}
```

---

### `nwn.project.validate_layout`

Check required folders and config files exist.

**Inputs:** none

**Output:**
```json
{
  "valid": true,
  "checks": [
    { "check": "nasher.cfg", "ok": true, "detail": "exists" },
    { "check": "src/scripts/", "ok": true, "detail": "exists" }
  ]
}
```

---

### `nwn.project.diff_summary`

Run `git diff --name-only HEAD` and group files by NWN concept.

**Inputs:**
- `staged` (boolean, optional): diff `--cached` instead of HEAD.

**Output:**
```json
{
  "totalFiles": 3,
  "groups": {
    "scripts": ["src/scripts/inc_quests.nss"],
    "dialogs": [],
    "areas": [],
    "other": ["nasher.cfg"]
  }
}
```

---

### `nwn.project.create_feature_branch`

Create and switch to `feature/<name>`.

**Inputs:**
- `name` (string): branch name suffix (e.g. `quest-merchant`).

**Output:** `{ "ok": true, "branch": "feature/quest-merchant" }`

---

### `nwn.nasher.build`

Run `nasher pack <target>`.

**Inputs:**
- `target` (`"module" | "art" | "tlk" | "all"`, default `"module"`).

**Output:**
```json
{
  "ok": true,
  "results": [{ "target": "module", "ok": true, "outputPath": "/abs/path/build/dist/module.mod" }]
}
```

---

### `nwn.nasher.validate`

Validate source JSON files and required project structure.

**Inputs:** none

**Output:**
```json
{ "ok": true, "checkedFiles": 12, "issues": [] }
```

---

### `nwn.nasher.clean`

Remove `build/` artifacts. Requires `allowDeleteFiles: true`.

**Inputs:** none

---

### `nwn.nasher.resource_lookup`

Search for a resref in `src/`.

**Inputs:**
- `resref` (string): the resref to find (case-insensitive).

---

### `nwn.script.compile`

Compile a single `.nss` file with nwnsc.

**Inputs:**
- `file` (string): path relative to workspace root.

**Output:**
```json
{
  "ok": false,
  "diagnostics": [
    { "file": "src/scripts/inc_quests.nss", "line": 42, "severity": "error", "message": "Undeclared identifier \"oFoo\"" }
  ]
}
```

---

### `nwn.script.compile_all`

Compile all `.nss` files. Returns aggregate diagnostics.

**Inputs:** none

---

### `nwn.script.find_symbol`

Search for a function, constant, or `#include` in `.nss` files.

**Inputs:**
- `symbol` (string): name or pattern.
- `type` (`"function" | "constant" | "include" | "any"`, default `"any"`).

---

### `nwn.script.diagnostics`

Compile a file and return only the structured diagnostics.

**Inputs:**
- `file` (string): path relative to workspace root.

---

### `nwn.docs.search`

Search `docs/` for a query string.

**Inputs:**
- `query` (string): case-insensitive substring.
- `maxResults` (number, default 10).

---

### `nwn.docs.add_decision`

Create an ADR in `docs/ADR/`.

**Inputs:**
- `title` (string)
- `context` (string)
- `decision` (string)
- `consequences` (string)

**Output:** `{ "ok": true, "file": "docs/ADR/ADR-0001-my-decision.md", "adrNumber": 1 }`

---

### `nwn.aurora.launch`

Launch Aurora Toolset. Requires `allowAuroraLaunch: true` and
`auroraToolset.command` to be set.

---

### `nwn.aurora.snapshot`

Copy a `.mod` file to `build/snapshots/<timestamp>-<label>.mod`.

**Inputs:**
- `source` (string): path to source `.mod`, relative to workspace root.
- `label` (string, default `"snapshot"`).

---

### Scaffolded tools (not yet implemented)

These tools exist as stubs. They return `{ "ok": false, "error": "not yet implemented" }`.

| Tool | Planned purpose |
|------|----------------|
| `nwn.aurora.watch_changes` | Watch Aurora save events |
| `nwn.aurora.import_after_save` | Auto-import on toolset save |
| `nwn.nwnx.check_installation` | Verify NWNX setup |
| `nwn.nwnx.list_plugins` | List NWNX plugins |
| `nwn.nwnx.start_server` | Start NWNX server (requires `allowStartServer`) |
| `nwn.nwnx.stop_server` | Stop running server |
| `nwn.nwnx.tail_logs` | Stream server logs |
| `nwn.nwnx.run_smoke_test` | Headless smoke test |
| `nwn.assets.index` | Build art asset index |
| `nwn.assets.find_resref` | Look up resref in hak files |
| `nwn.assets.audit_attribution` | Audit asset attribution |

---

## Permission tiers

| Tier | Tools | Controlled by |
|------|-------|--------------|
| Read-only | `inspect`, `validate_layout`, `diff_summary`, `find_symbol`, `docs.search`, `resource_lookup` | Always enabled |
| Workspace-write | `create_feature_branch`, `nasher.build`, `docs.add_decision`, `aurora.snapshot` | Always enabled |
| Requires flag | `nasher.clean` | `allowDeleteFiles` |
| Requires flag | `aurora.launch` | `allowAuroraLaunch` |
| Requires flag | `nwnx.start_server` | `allowStartServer` |
| Requires flag | Install to NWN_HOME | `allowInstallToNwnUserDir` |

---

## Security model

- **Path validation:** All file paths are validated with `safePath()` before
  use. Paths that escape the workspace root are rejected with an error.
- **No arbitrary commands:** Only pre-defined, whitelisted commands are
  executed (`nasher`, `nwnsc`, `git`, `grep`). No `exec(userInput)` patterns.
- **No shell injection:** Commands are passed as argument arrays to `execFile`,
  never concatenated into shell strings.
- **Permission gates:** Dangerous operations (launch, delete, server start) are
  gated behind explicit boolean flags in `nwn-mcp.config.json`.

---

## Adding a new tool

1. Add your implementation to an existing file in `src/tools/`, or create a new
   `src/tools/my_category.ts`.
2. Export a `registerMyTools(server: Server, config: Config): void` function.
3. Import and call it in `src/index.ts`.
4. Add the tool to this document's tool reference table.
5. Rebuild: `npm run build`.
