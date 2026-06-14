import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export const ConfigSchema = z.object({
  workspaceRoot: z.string().default("."),
  tools: z.object({
    nasher: z.object({ command: z.string().default("nasher") }),
    nwscriptCompiler: z.object({ command: z.string().default("nwnsc") }),
    auroraToolset: z.object({ command: z.string().default("") }),
    nwnx: z.object({
      root: z.string().default(""),
      serverCommand: z.string().default(""),
    }),
  }),
  paths: z.object({
    moduleSource: z.string().default("src/module"),
    scripts: z.string().default("src/scripts"),
    docs: z.string().default("docs"),
    hakSource: z.string().default("src/2da"),
    dist: z.string().default("build/dist"),
    build: z.string().default("build"),
  }),
  permissions: z.object({
    allowInstallToNwnUserDir: z.boolean().default(false),
    allowStartServer: z.boolean().default(false),
    allowAuroraLaunch: z.boolean().default(true),
    allowDeleteFiles: z.boolean().default(false),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(configPath?: string): Config {
  const searchPaths = [
    configPath,
    "nwn-mcp.config.json",
    "tools/mcp/nwn-project-mcp/nwn-mcp.config.json",
  ].filter((p): p is string => Boolean(p));

  for (const p of searchPaths) {
    const resolved = resolve(p);
    if (existsSync(resolved)) {
      const raw = JSON.parse(readFileSync(resolved, "utf-8"));
      return ConfigSchema.parse(raw);
    }
  }

  return ConfigSchema.parse({});
}
