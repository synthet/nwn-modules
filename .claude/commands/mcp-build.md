Build the MCP server so AI assistants can call NWN tooling directly.

The active MCP server is `tools/mcp/nwn-mcp/`:

```bash
cd tools/mcp/nwn-mcp
npm install
npm run build
```

Run the tests:

```bash
npm test
```

The built entry point is `dist/server.js`. Configure your AI client using `tools/mcp/nwn-mcp/examples/mcp-client-config.json` as a template.

Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "nwn": {
      "command": "node",
      "args": ["/absolute/path/to/nwn-modules/tools/mcp/nwn-mcp/dist/server.js"],
      "env": {
        "NWN_ROOT": "/path/to/NeverwinterNightsEE"
      }
    }
  }
}
```

Cursor (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "nwn": {
      "command": "node",
      "args": ["tools/mcp/nwn-mcp/dist/server.js"]
    }
  }
}
```

Full tool reference: `docs/mcp-tools.md`.
