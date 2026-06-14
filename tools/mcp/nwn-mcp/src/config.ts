import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

export const ConfigSchema = z.object({
  workspaceRoot: z.string().default('.'),
  tools: z.object({
    nasher: z.object({ command: z.string().default('nasher') }).default({}),
    nwscriptCompiler: z.object({ command: z.string().default('nwnsc') }).default({}),
    auroraToolset: z.object({ command: z.string().default('nwtoolset') }).default({}),
    nwnx: z.object({ root: z.string().default('./external/nwnx'), serverCommand: z.string().default('./external/nwnx/nwserver') }).default({})
  }).default({}),
  paths: z.object({
    moduleSource: z.string().default('module'), scripts: z.string().default('scripts'), docs: z.string().default('docs'),
    hakSource: z.string().default('hak/source'), dist: z.string().default('dist'), build: z.string().default('build')
  }).default({}),
  permissions: z.object({ allowInstallToNwnUserDir: z.boolean().default(false), allowStartServer: z.boolean().default(false), allowAuroraLaunch: z.boolean().default(false) }).default({})
});
export type NwnMcpConfig = z.infer<typeof ConfigSchema> & { resolvedWorkspaceRoot: string };
export async function loadConfig(configPath = process.env.NWN_MCP_CONFIG ?? 'nwn-mcp.config.json'): Promise<NwnMcpConfig> {
  let raw = '{}'; try { raw = await readFile(configPath, 'utf8'); } catch {}
  const parsed = ConfigSchema.parse(JSON.parse(raw));
  const base = path.dirname(path.resolve(configPath));
  return { ...parsed, resolvedWorkspaceRoot: path.resolve(base, parsed.workspaceRoot) };
}
