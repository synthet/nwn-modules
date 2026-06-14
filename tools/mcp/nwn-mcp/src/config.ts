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
function resolveNwnxPaths(
  nwnx: { root: string; serverCommand: string },
  base: string,
  toolsRoot?: string
): { root: string; serverCommand: string } {
  if (!toolsRoot) return nwnx;
  const usesDefaultRoot = nwnx.root === './external/nwnx' || nwnx.root === 'external/nwnx';
  const usesDefaultServer = nwnx.serverCommand === './external/nwnx/nwserver' || nwnx.serverCommand === 'external/nwnx/nwserver';
  const serverName = process.platform === 'win32' ? 'nwserver.exe' : 'nwserver';
  return {
    root: usesDefaultRoot ? path.join(toolsRoot, 'nwnx') : path.resolve(base, nwnx.root),
    serverCommand: usesDefaultServer ? path.join(toolsRoot, 'nwnx', serverName) : path.resolve(base, nwnx.serverCommand)
  };
}

export async function loadConfig(configPath = process.env.NWN_MCP_CONFIG ?? 'nwn-mcp.config.json'): Promise<NwnMcpConfig> {
  let raw = '{}'; try { raw = await readFile(configPath, 'utf8'); } catch {}
  const parsed = ConfigSchema.parse(JSON.parse(raw));
  const base = path.dirname(path.resolve(configPath));
  const toolsRoot = process.env.NWN_TOOLS ? path.resolve(process.env.NWN_TOOLS) : undefined;
  const tools = {
    ...parsed.tools,
    nwnx: resolveNwnxPaths(parsed.tools.nwnx, base, toolsRoot)
  };
  return { ...parsed, tools, resolvedWorkspaceRoot: path.resolve(base, parsed.workspaceRoot) };
}
