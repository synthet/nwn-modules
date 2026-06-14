/**
 * Asset tool stubs.
 *
 * All tools in this module are scaffolded — they return a clear
 * "not yet implemented" response. Full implementation requires an
 * asset index built from the hak/art pipeline.
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
            (detail ?? "This tool is scaffolded for future asset pipeline integration."),
        }),
      },
    ],
  };
}

export function registerAssetsTools(server: Server, config: Config): void {
  // ---- nwn.assets.index ----------------------------------------------------
  server.tool(
    "nwn.assets.index",
    "[Scaffolded] Build an index of all art assets in the art/ directory. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.assets.index")
  );

  // ---- nwn.assets.find_resref ----------------------------------------------
  server.tool(
    "nwn.assets.find_resref",
    "[Scaffolded] Look up a resref across built hak files and art assets. Not yet implemented.",
    {},
    async () =>
      scaffoldedResponse(
        "nwn.assets.find_resref",
        "Use nwn.nasher.resource_lookup to search source files instead."
      )
  );

  // ---- nwn.assets.audit_attribution ----------------------------------------
  server.tool(
    "nwn.assets.audit_attribution",
    "[Scaffolded] Audit art assets for missing or incomplete attribution metadata. Not yet implemented.",
    {},
    async () => scaffoldedResponse("nwn.assets.audit_attribution")
  );
}
