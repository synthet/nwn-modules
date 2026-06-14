# NWN MCP Agentic Tooling

Local, workspace-scoped MCP tooling for a Neverwinter Nights: Enhanced Edition module project. The MVP keeps Aurora Toolset as the human editor and exposes safe source-control, Nasher, NWScript, documentation, and snapshot workflows to AI clients.

## Design principles

- No generic shell tool is exposed.
- Every file path is resolved under the configured workspace root and path traversal is rejected.
- Tools return structured JSON.
- Dangerous operations are gated by explicit config flags or scaffolded until implemented safely.
- Aurora round-tripping follows: **Aurora Toolset → save module → Nasher unpack → Git diff → validate → build → test → report**.

## Implemented MVP tools

- `nwn.project.inspect`
- `nwn.project.validate_layout`
- `nwn.project.diff_summary`
- `nwn.nasher.build`
- `nwn.nasher.validate`
- `nwn.nasher.resource_lookup`
- `nwn.script.compile`
- `nwn.script.compile_all`
- `nwn.script.find_symbol`
- `nwn.docs.search`
- `nwn.aurora.launch`
- `nwn.aurora.snapshot`

The Toolset watcher/import, NWNX server workflows, and asset indexing/auditing tools are scaffolded and intentionally return `implemented: false` until their safety model is completed.

## Setup

```bash
cd tools/mcp/nwn-mcp
npm install
npm run build
```

Copy `nwn-mcp.config.example.json` to the repository root as `nwn-mcp.config.json` and adjust command names if needed. Do not commit user-specific absolute paths.

## Example MCP client configuration

See [`examples/mcp-client-config.json`](examples/mcp-client-config.json):

```json
{
  "mcpServers": {
    "nwn": {
      "command": "node",
      "args": ["tools/mcp/nwn-mcp/dist/server.js"],
      "env": { "NWN_MCP_CONFIG": "nwn-mcp.config.json" }
    }
  }
}
```

## Configuration

```json
{
  "workspaceRoot": ".",
  "tools": {
    "nasher": { "command": "nasher" },
    "nwscriptCompiler": { "command": "nwnsc" },
    "auroraToolset": { "command": "nwtoolset" },
    "nwnx": {
      "root": "./external/nwnx",
      "serverCommand": "./external/nwnx/nwserver"
    }
  },
  "paths": {
    "moduleSource": "src",
    "scripts": "src/scripts",
    "docs": "docs",
    "hakSource": "hak/source",
    "dist": "build/dist",
    "build": "build"
  },
  "permissions": {
    "allowInstallToNwnUserDir": false,
    "allowStartServer": false,
    "allowAuroraLaunch": true
  }
}
```

## Testing

```bash
npm test
```

Tests cover path traversal rejection, safe command construction, gated dangerous operations, fixture project inspection, symbol search, and compiler diagnostic parsing with mocked external binaries.
