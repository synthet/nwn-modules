import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { existsSync, readdirSync } from "fs";
import { join, resolve, basename } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { Config } from "../config.js";
import { runCommand } from "../utils/exec.js";
import { safePath } from "../utils/paths.js";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// nwnsc diagnostic parser
// nwnsc outputs errors in format: filename.nss(42): Error: Undeclared identifier "x"
// ---------------------------------------------------------------------------

export interface ScriptDiagnostic {
  file: string;
  line: number;
  column: number | null;
  severity: "error" | "warning" | "info";
  message: string;
  raw: string;
}

const NWNSC_DIAG_RE =
  /^(.+?\.nss)\((\d+)(?:,(\d+))?\):\s*(Error|Warning|Note|Info):\s*(.+)$/i;

export function parseNwnscOutput(
  raw: string,
  fallbackFile: string
): ScriptDiagnostic[] {
  const diagnostics: ScriptDiagnostic[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const m = trimmed.match(NWNSC_DIAG_RE);
    if (m) {
      const sev = m[4].toLowerCase();
      diagnostics.push({
        file: m[1],
        line: parseInt(m[2], 10),
        column: m[3] ? parseInt(m[3], 10) : null,
        severity:
          sev === "error"
            ? "error"
            : sev === "warning"
            ? "warning"
            : "info",
        message: m[5],
        raw: trimmed,
      });
    } else if (trimmed.length > 0) {
      // Non-structured line — include as info
      diagnostics.push({
        file: fallbackFile,
        line: 0,
        column: null,
        severity: "info",
        message: trimmed,
        raw: trimmed,
      });
    }
  }
  return diagnostics;
}

// ---------------------------------------------------------------------------
// Helper: recursively find .nss files
// ---------------------------------------------------------------------------
function findNssFiles(dir: string, results: string[] = []): string[] {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findNssFiles(full, results);
    } else if (entry.name.endsWith(".nss")) {
      results.push(full);
    }
  }
  return results;
}

export function registerScriptTools(server: Server, config: Config): void {
  const root = resolve(config.workspaceRoot);
  const nwnscCmd = config.tools.nwscriptCompiler.command;
  const scriptsDir = join(root, config.paths.scripts);

  // ---- nwn.script.compile --------------------------------------------------
  server.tool(
    "nwn.script.compile",
    "Compile a single NWScript .nss file using nwnsc. Returns structured diagnostics.",
    {
      file: z
        .string()
        .describe("Path to .nss file, relative to workspace root."),
    },
    async ({ file }) => {
      const filePath = safePath(root, file);

      if (!existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: false, error: `File not found: ${file}` }),
            },
          ],
        };
      }

      const args = ["-e", "-o", "/dev/null"];
      if (process.env.NWN_ROOT) args.push("-n", process.env.NWN_ROOT);
      args.push(filePath);

      const result = await runCommand(nwnscCmd, args, root);
      const rawOutput = result.stdout + "\n" + result.stderr;
      const diagnostics = parseNwnscOutput(rawOutput, file);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: result.exitCode === 0,
                file,
                exitCode: result.exitCode,
                diagnostics,
                durationMs: result.durationMs,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ---- nwn.script.compile_all ----------------------------------------------
  server.tool(
    "nwn.script.compile_all",
    "Find all .nss files in src/scripts/ and compile each. Returns aggregate diagnostics.",
    {},
    async () => {
      const files = findNssFiles(scriptsDir);

      if (files.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: true,
                message: "No .nss files found.",
                compiled: 0,
                failed: 0,
                diagnostics: [],
              }),
            },
          ],
        };
      }

      let compiled = 0;
      let failed = 0;
      const allDiagnostics: ScriptDiagnostic[] = [];

      for (const f of files) {
        const relPath = f.replace(root + "/", "");
        const args = ["-e", "-o", "/dev/null"];
        if (process.env.NWN_ROOT) args.push("-n", process.env.NWN_ROOT);
        args.push(f);

        const result = await runCommand(nwnscCmd, args, root);
        if (result.exitCode === 0) {
          compiled++;
        } else {
          failed++;
          const rawOutput = result.stdout + "\n" + result.stderr;
          allDiagnostics.push(...parseNwnscOutput(rawOutput, relPath));
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: failed === 0,
                compiled,
                failed,
                total: files.length,
                diagnostics: allDiagnostics,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ---- nwn.script.find_symbol ----------------------------------------------
  server.tool(
    "nwn.script.find_symbol",
    "Search for a function, constant, or #include in .nss files using grep.",
    {
      symbol: z
        .string()
        .describe("Symbol name or pattern to search for."),
      type: z
        .enum(["function", "constant", "include", "any"])
        .optional()
        .default("any")
        .describe("What kind of symbol to look for."),
    },
    async ({ symbol, type }) => {
      // Build a grep pattern based on type
      let pattern: string;
      switch (type) {
        case "function":
          pattern = `(^|\\s)${symbol}\\s*\\(`;
          break;
        case "constant":
          pattern = `const\\s+\\w+\\s+${symbol}\\s*=`;
          break;
        case "include":
          pattern = `#include\\s+"${symbol}"`;
          break;
        default:
          pattern = symbol;
      }

      const args = ["-rn", "--include=*.nss", "-E", pattern, scriptsDir];
      let stdout = "";
      let stderr = "";

      try {
        const result = await execFileAsync("grep", args);
        stdout = result.stdout;
      } catch (err: unknown) {
        const e = err as { stdout?: string; stderr?: string; code?: number };
        stdout = e.stdout ?? "";
        stderr = e.stderr ?? "";
        // exit code 1 from grep means "no matches" — not an error
        if (e.code !== 1) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: false,
                  error: stderr || String(err),
                  matches: [],
                }),
              },
            ],
          };
        }
      }

      const matches = stdout
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const colonIdx = line.indexOf(":");
          const rest = line.slice(colonIdx + 1);
          const lineNoIdx = rest.indexOf(":");
          return {
            file: line.slice(0, colonIdx).replace(root + "/", ""),
            line: parseInt(rest.slice(0, lineNoIdx), 10),
            text: rest.slice(lineNoIdx + 1).trim(),
          };
        });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: true, symbol, pattern, matchCount: matches.length, matches },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ---- nwn.script.diagnostics ----------------------------------------------
  server.tool(
    "nwn.script.diagnostics",
    "Compile a single NWScript file and return only the structured diagnostics (alias for compile).",
    {
      file: z
        .string()
        .describe("Path to .nss file, relative to workspace root."),
    },
    async ({ file }) => {
      const filePath = safePath(root, file);

      if (!existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: false, error: `File not found: ${file}`, diagnostics: [] }),
            },
          ],
        };
      }

      const args = ["-e", "-o", "/dev/null"];
      if (process.env.NWN_ROOT) args.push("-n", process.env.NWN_ROOT);
      args.push(filePath);

      const result = await runCommand(nwnscCmd, args, root);
      const rawOutput = result.stdout + "\n" + result.stderr;
      const diagnostics = parseNwnscOutput(rawOutput, file);

      const errors   = diagnostics.filter((d) => d.severity === "error");
      const warnings = diagnostics.filter((d) => d.severity === "warning");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: result.exitCode === 0,
                file,
                errorCount: errors.length,
                warningCount: warnings.length,
                diagnostics,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
