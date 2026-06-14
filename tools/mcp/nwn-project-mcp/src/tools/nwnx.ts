/**
 * NWNX tool stubs.
 *
 * All tools in this module are scaffolded — they return a clear
 * "not yet implemented" response. Full implementation requires NWNX
 * to be installed and a server configuration to be set up.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Config } from "../config.js";

function scaffoldedResponse(toolName: string, detail?: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          ok: false,
          error:
            `${toolName} is not yet implemented. ` +
            (detail ?? "This tool is scaffolded for future NWNX integration."),
        }),
      },
    ],
  };
}

export function registerNwnxTools(server: Server, config: Config): void {
  // ---- nwn.nwnx.check_installation -----------------------------------------
  server.tool(
    "nwn.nwnx.check_installation",
    "[Scaffolded] Check whether NWNX is installed and configured. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.nwnx.check_installation")
  );

  // ---- nwn.nwnx.list_plugins -----------------------------------------------
  server.tool(
    "nwn.nwnx.list_plugins",
    "[Scaffolded] List available NWNX plugins. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.nwnx.list_plugins")
  );

  // ---- nwn.nwnx.start_server -----------------------------------------------
  server.tool(
    "nwn.nwnx.start_server",
    "[Scaffolded] Start an NWNX-enabled NWN server. Requires allowStartServer permission. Not yet implemented.",
    {},
    async () => {
      if (!config.permissions.allowStartServer) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error:
                  "Permission denied: allowStartServer is false in nwn-mcp.config.json. " +
                  "Set it to true to enable this tool (use with caution).",
              }),
            },
          ],
        };
      }
      return scaffoldedResponse(
        "nwn.nwnx.start_server",
        "Even with allowStartServer=true this tool is not yet implemented."
      );
    }
  );

  // ---- nwn.nwnx.stop_server ------------------------------------------------
  server.tool(
    "nwn.nwnx.stop_server",
    "[Scaffolded] Stop the running NWNX server. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.nwnx.stop_server")
  );

  // ---- nwn.nwnx.tail_logs --------------------------------------------------
  server.tool(
    "nwn.nwnx.tail_logs",
    "[Scaffolded] Stream the last N lines of NWNX server logs. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.nwnx.tail_logs")
  );

  // ---- nwn.nwnx.run_smoke_test ---------------------------------------------
  server.tool(
    "nwn.nwnx.run_smoke_test",
    "[Scaffolded] Launch the module in headless mode and run smoke tests. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.nwnx.run_smoke_test")
  );
}
