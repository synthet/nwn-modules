import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { Config } from "../config.js";
import { safePath } from "../utils/paths.js";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Helper: count files with given extension recursively
// ---------------------------------------------------------------------------
function countFiles(dir: string, ext: string): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(join(dir, entry.name), ext);
    } else if (entry.name.endsWith(ext)) {
      count += 1;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------
export function registerProjectTools(server: McpServer, config: Config): void {
  const root = resolve(config.workspaceRoot);

  // ---- nwn.project.inspect -------------------------------------------------
  server.tool(
    "nwn.project.inspect",
    "Detect and return project structure: nasher.cfg presence, tool configs, script/area/dialog counts.",
    {},
    async () => {
      const nasherExists = existsSync(join(root, "nasher.cfg"));
      const mcpConfigExists = existsSync(join(root, "nwn-mcp.config.json"));
      const gitIgnoreExists = existsSync(join(root, ".gitignore"));

      const scriptsDir = join(root, config.paths.scripts);
      const areasDir   = join(root, "src/areas");
      const dialogsDir = join(root, "src/dialogs");
      const blueprintsDir = join(root, "src/blueprints");

      const scriptCount    = countFiles(scriptsDir, ".nss");
      const areaCount      = countFiles(areasDir, ".are.json");
      const dialogCount    = countFiles(dialogsDir, ".dlg.json");
      const blueprintCount = countFiles(blueprintsDir, ".json");

      const data = {
        workspaceRoot: root,
        nasherCfg: nasherExists,
        mcpConfig: mcpConfigExists,
        gitIgnore: gitIgnoreExists,
        counts: {
          scripts: scriptCount,
          areas: areaCount,
          dialogs: dialogCount,
          blueprints: blueprintCount,
        },
        toolConfig: {
          nasherCommand: config.tools.nasher.command,
          nwscriptCompilerCommand: config.tools.nwscriptCompiler.command,
          auroraCommand: config.tools.auroraToolset.command || "(not set)",
        },
        permissions: config.permissions,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ---- nwn.project.validate_layout -----------------------------------------
  server.tool(
    "nwn.project.validate_layout",
    "Check required folders exist, nasher.cfg is present, .gitignore excludes build artifacts, docs/ exists.",
    {},
    async () => {
      const checks: Array<{ check: string; ok: boolean; detail: string }> = [];

      const required = [
        { path: "nasher.cfg", label: "nasher.cfg" },
        { path: "src/scripts", label: "src/scripts/" },
        { path: "src/module", label: "src/module/" },
        { path: "src/areas", label: "src/areas/" },
        { path: "src/dialogs", label: "src/dialogs/" },
        { path: "src/blueprints", label: "src/blueprints/" },
        { path: "docs", label: "docs/" },
        { path: ".gitignore", label: ".gitignore" },
      ];

      for (const { path: p, label } of required) {
        const full = join(root, p);
        const ok = existsSync(full);
        checks.push({ check: label, ok, detail: ok ? "exists" : "MISSING" });
      }

      // Check .gitignore excludes build artifacts
      const gitIgnorePath = join(root, ".gitignore");
      if (existsSync(gitIgnorePath)) {
        const gi = readFileSync(gitIgnorePath, "utf-8");
        const excludesMod = gi.includes("*.mod") || gi.includes("build/dist");
        checks.push({
          check: ".gitignore excludes build artifacts",
          ok: excludesMod,
          detail: excludesMod ? "OK" : ".mod or build/dist not in .gitignore",
        });
      }

      const allOk = checks.every((c) => c.ok);
      const data = { valid: allOk, checks };

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ---- nwn.project.diff_summary --------------------------------------------
  server.tool(
    "nwn.project.diff_summary",
    "Run git diff --name-only HEAD and group changed files by NWN concept (scripts, dialogs, areas, blueprints, assets, docs, other).",
    {
      staged: z.boolean().optional().describe("If true, diff --cached (staged changes only)."),
    },
    async ({ staged }) => {
      const args = ["diff", "--name-only", staged ? "--cached" : "HEAD"];

      let stdout = "";
      try {
        const result = await execFileAsync("git", args, { cwd: root });
        stdout = result.stdout;
      } catch (err: unknown) {
        const e = err as { stdout?: string; stderr?: string };
        stdout = e.stdout ?? "";
        if (!stdout) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: false,
                  error: String(err),
                  files: [],
                  groups: {},
                }),
              },
            ],
          };
        }
      }

      const files = stdout.split("\n").filter(Boolean);

      const groups: Record<string, string[]> = {
        scripts: [],
        dialogs: [],
        areas: [],
        blueprints: [],
        assets: [],
        docs: [],
        ci: [],
        tooling: [],
        other: [],
      };

      for (const f of files) {
        if (f.startsWith("src/scripts/") || f.endsWith(".nss")) {
          groups.scripts.push(f);
        } else if (f.startsWith("src/dialogs/") || f.endsWith(".dlg.json")) {
          groups.dialogs.push(f);
        } else if (f.startsWith("src/areas/") || f.endsWith(".are.json") || f.endsWith(".git.json") || f.endsWith(".gic.json")) {
          groups.areas.push(f);
        } else if (f.startsWith("src/blueprints/") || f.endsWith(".utc.json") || f.endsWith(".utp.json")) {
          groups.blueprints.push(f);
        } else if (f.startsWith("art/")) {
          groups.assets.push(f);
        } else if (f.startsWith("docs/")) {
          groups.docs.push(f);
        } else if (f.startsWith(".github/")) {
          groups.ci.push(f);
        } else if (f.startsWith("tools/") || f.startsWith("scripts/")) {
          groups.tooling.push(f);
        } else {
          groups.other.push(f);
        }
      }

      const data = { ok: true, totalFiles: files.length, files, groups };
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ---- nwn.project.create_feature_branch -----------------------------------
  server.tool(
    "nwn.project.create_feature_branch",
    "Create and switch to a feature branch with naming convention feature/<name>.",
    {
      name: z.string().describe("Branch name suffix, e.g. 'quest-merchant' → branch 'feature/quest-merchant'."),
    },
    async ({ name }) => {
      const branchName = `feature/${name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

      try {
        await execFileAsync("git", ["checkout", "-b", branchName], { cwd: root });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: true, branch: branchName }),
            },
          ],
        };
      } catch (err: unknown) {
        const e = err as { stderr?: string };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                branch: branchName,
                error: e.stderr ?? String(err),
              }),
            },
          ],
        };
      }
    }
  );
}
