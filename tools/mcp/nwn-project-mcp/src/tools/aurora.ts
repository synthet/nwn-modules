import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { existsSync, copyFileSync, mkdirSync, readdirSync } from "fs";
import { join, resolve, basename } from "path";
import { spawn } from "child_process";
import { Config } from "../config.js";
import { safePath } from "../utils/paths.js";

export function registerAuroraTools(server: Server, config: Config): void {
  const root = resolve(config.workspaceRoot);

  // ---- nwn.aurora.launch ---------------------------------------------------
  server.tool(
    "nwn.aurora.launch",
    "Launch the Aurora Toolset if allowAuroraLaunch is true and auroraToolset.command is configured.",
    {},
    async () => {
      if (!config.permissions.allowAuroraLaunch) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error:
                  "allowAuroraLaunch is false in nwn-mcp.config.json. Set it to true to enable this tool.",
              }),
            },
          ],
        };
      }

      const auroraCmd = config.tools.auroraToolset.command;
      if (!auroraCmd) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error:
                  "auroraToolset.command is not set in nwn-mcp.config.json. " +
                  "Set it to the path of nwtoolset.exe (Windows) or the Aurora launcher.",
              }),
            },
          ],
        };
      }

      if (!existsSync(auroraCmd)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error: `Aurora binary not found at: ${auroraCmd}`,
              }),
            },
          ],
        };
      }

      // Launch detached — the toolset runs independently
      const proc = spawn(auroraCmd, [], {
        detached: true,
        stdio: "ignore",
        cwd: root,
      });
      proc.unref();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              message: `Aurora Toolset launched: ${auroraCmd}`,
              pid: proc.pid,
            }),
          },
        ],
      };
    }
  );

  // ---- nwn.aurora.snapshot -------------------------------------------------
  server.tool(
    "nwn.aurora.snapshot",
    "Copy a .mod file to build/snapshots/<timestamp>-<label>.mod.",
    {
      source: z
        .string()
        .describe("Path to the .mod file to snapshot, relative to workspace root."),
      label: z
        .string()
        .optional()
        .default("snapshot")
        .describe("Label to include in the snapshot filename."),
    },
    async ({ source, label }) => {
      const sourcePath = safePath(root, source);

      if (!existsSync(sourcePath)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: false, error: `Source file not found: ${source}` }),
            },
          ],
        };
      }

      const snapshotsDir = join(root, "build", "snapshots");
      safePath(root, "build/snapshots");

      if (!existsSync(snapshotsDir)) {
        mkdirSync(snapshotsDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);

      const safeLabel = label.replace(/[^a-zA-Z0-9._-]/g, "-");
      const destFilename = `${timestamp}-${safeLabel}.mod`;
      const destPath = join(snapshotsDir, destFilename);

      copyFileSync(sourcePath, destPath);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              source,
              destination: destPath.replace(root + "/", ""),
            }),
          },
        ],
      };
    }
  );

  // ---- nwn.aurora.watch_changes (scaffolded) --------------------------------
  server.tool(
    "nwn.aurora.watch_changes",
    "[Scaffolded] Watch for Aurora Toolset save events and trigger re-import. Not yet implemented.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: "nwn.aurora.watch_changes is not yet implemented. " +
              "This tool is scaffolded for future integration with Aurora file-watch events.",
          }),
        },
      ],
    })
  );

  // ---- nwn.aurora.import_after_save (scaffolded) ---------------------------
  server.tool(
    "nwn.aurora.import_after_save",
    "[Scaffolded] Automatically import Aurora-saved resources after a toolset save. Not yet implemented.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: false,
            error: "nwn.aurora.import_after_save is not yet implemented. " +
              "This tool is scaffolded for a future Aurora save-hook workflow.",
          }),
        },
      ],
    })
  );
}
