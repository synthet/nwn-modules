/**
 * NWN Project MCP Server
 *
 * Exposes NWN:EE module development tooling as MCP tools that AI coding
 * assistants can call during a session. All tools are defined in the
 * src/tools/ directory and registered here.
 *
 * Usage:
 *   node dist/index.js
 *
 * Configuration is loaded from nwn-mcp.config.json (repo root or
 * tools/mcp/nwn-project-mcp/).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { registerProjectTools } from "./tools/project.js";
import { registerNasherTools } from "./tools/nasher.js";
import { registerScriptTools } from "./tools/script.js";
import { registerDocsTools } from "./tools/docs.js";
import { registerAuroraTools } from "./tools/aurora.js";
import { registerNwnxTools } from "./tools/nwnx.js";
import { registerAssetsTools } from "./tools/assets.js";

async function main(): Promise<void> {
  const config = loadConfig();

  const server = new McpServer(
    { name: "nwn-project-mcp", version: "0.1.0" }
  );

  // Register all tool groups
  registerProjectTools(server, config);
  registerNasherTools(server, config);
  registerScriptTools(server, config);
  registerDocsTools(server, config);
  registerAuroraTools(server, config);
  registerNwnxTools(server, config);
  registerAssetsTools(server, config);

  // Connect via stdio transport (standard MCP pattern)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't pollute the MCP stdio protocol stream
  process.stderr.write("nwn-project-mcp server started\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err}\n`);
  process.exit(1);
});
