import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "fs";
import { join, resolve } from "path";
import { Config } from "../config.js";
import { runCommand, makeResponse } from "../utils/exec.js";
import { safePath } from "../utils/paths.js";

// ---------------------------------------------------------------------------
// Helper: recursively find files matching a predicate
// ---------------------------------------------------------------------------
function findFiles(
  dir: string,
  predicate: (name: string) => boolean,
  results: string[] = []
): string[] {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, predicate, results);
    } else if (predicate(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

export function registerNasherTools(server: Server, config: Config): void {
  const root = resolve(config.workspaceRoot);
  const nasherCmd = config.tools.nasher.command;

  // ---- nwn.nasher.build ----------------------------------------------------
  server.tool(
    "nwn.nasher.build",
    "Run nasher pack <target> to build the module. Default target: module.",
    {
      target: z
        .enum(["module", "art", "tlk", "all"])
        .optional()
        .default("module")
        .describe("Nasher build target."),
    },
    async ({ target }) => {
      const targets = target === "all" ? ["module", "art", "tlk"] : [target];
      const results = [];
      let allOk = true;

      for (const t of targets) {
        const result = await runCommand(nasherCmd, ["pack", t], root);
        const ok = result.exitCode === 0;
        if (!ok) allOk = false;

        // Try to find output file path in nasher output
        const distMatch = result.stdout.match(
          /build[/\\]dist[/\\][^\s]+(\.mod|\.hak|\.tlk)/
        );
        const outputPath = distMatch
          ? join(root, distMatch[0].replace(/\\/g, "/"))
          : null;

        results.push({
          target: t,
          ok,
          exitCode: result.exitCode,
          outputPath,
          stdout: result.stdout,
          stderr: result.stderr,
          durationMs: result.durationMs,
        });
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: allOk, results }, null, 2),
          },
        ],
      };
    }
  );

  // ---- nwn.nasher.validate -------------------------------------------------
  server.tool(
    "nwn.nasher.validate",
    "Validate the project structure and check for malformed JSON in src/**/*.json.",
    {},
    async () => {
      const issues: Array<{ file: string; error: string }> = [];
      const checked: string[] = [];

      // Check for malformed JSON in src/
      const srcDir = join(root, "src");
      const jsonFiles = findFiles(srcDir, (n) => n.endsWith(".json"));

      for (const f of jsonFiles) {
        try {
          JSON.parse(readFileSync(f, "utf-8"));
          checked.push(f.replace(root + "/", ""));
        } catch (err: unknown) {
          issues.push({
            file: f.replace(root + "/", ""),
            error: String(err),
          });
        }
      }

      // Check required files
      const required = ["nasher.cfg", "src/module"];
      for (const r of required) {
        if (!existsSync(join(root, r))) {
          issues.push({ file: r, error: "Required file/directory missing" });
        }
      }

      const ok = issues.length === 0;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok, checkedFiles: checked.length, issues },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ---- nwn.nasher.clean ----------------------------------------------------
  server.tool(
    "nwn.nasher.clean",
    "Remove build/ artifacts (NOT source files). Requires allowDeleteFiles permission.",
    {},
    async () => {
      if (!config.permissions.allowDeleteFiles) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error:
                  "Permission denied: allowDeleteFiles is false in nwn-mcp.config.json. Set it to true to enable this tool.",
              }),
            },
          ],
        };
      }

      const buildDir = join(root, config.paths.build);
      const distDir  = join(root, config.paths.dist);

      const removed: string[] = [];

      for (const dir of [distDir, buildDir]) {
        if (existsSync(dir)) {
          const safe = safePath(root, dir.replace(root + "/", ""));
          rmSync(safe, { recursive: true, force: true });
          removed.push(dir.replace(root + "/", ""));
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, removed }),
          },
        ],
      };
    }
  );

  // ---- nwn.nasher.resource_lookup ------------------------------------------
  server.tool(
    "nwn.nasher.resource_lookup",
    "Search for a resref in src/ directories. Returns matching files.",
    {
      resref: z
        .string()
        .describe("The resref to search for (case-insensitive)."),
    },
    async ({ resref }) => {
      const srcDir = join(root, "src");
      const allFiles = findFiles(srcDir, () => true);
      const lower = resref.toLowerCase();

      const matches = allFiles
        .filter((f) => f.toLowerCase().includes(lower))
        .map((f) => f.replace(root + "/", ""));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: true, resref, matchCount: matches.length, matches },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
