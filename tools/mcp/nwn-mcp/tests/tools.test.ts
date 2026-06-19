import { describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { createTools } from '../src/tools.js';
import type { NwnMcpConfig } from '../src/config.js';

vi.mock('execa', () => ({ execa: vi.fn(async (_cmd:string, args:string[]) => ({ exitCode: args.some((a:string)=>a.includes('bad.nss')) ? 1 : 0, stdout: args.some((a:string)=>a.includes('bad.nss')) ? 'bad.nss:31:5: error: Undeclared identifier: oPC' : 'ok', stderr: '' })) }));
async function fixture(overrides: Partial<NwnMcpConfig> = {}): Promise<{root:string; tools:ReturnType<typeof createTools>; config:NwnMcpConfig}> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'nwn-mcp-'));
  await mkdir(path.join(root,'src/scripts'),{recursive:true}); await mkdir(path.join(root,'src/dialogs'),{recursive:true}); await mkdir(path.join(root,'docs'),{recursive:true});
  await writeFile(path.join(root,'nasher.cfg'),'[target]\n'); await writeFile(path.join(root,'.gitignore'),'build/\ndist/\n*.mod\n*.hak\n*.tlk\n');
  await writeFile(path.join(root,'docs/ATTRIBUTION.md'),'# Attribution\n'); await writeFile(path.join(root,'docs/BUILD.md'),'# Build\nNasher build docs\n');
  await writeFile(path.join(root,'src/scripts/inc_test.nss'),'void TestSymbol() {}\n');
  const cfg: NwnMcpConfig = { workspaceRoot:'.', resolvedWorkspaceRoot:root, tools:{nasher:{command:'nasher'}, nwscriptCompiler:{command:'nwnsc'}, auroraToolset:{command:'toolset'}, nwnx:{root:'external/nwnx', serverCommand:'external/nwnx/nwserver'}}, paths:{moduleSource:'src', scripts:'src/scripts', docs:'docs', hakSource:'hak/source', dist:'build/dist', build:'build'}, permissions:{allowInstallToNwnUserDir:false, allowStartServer:false, allowAuroraLaunch:false} };
  const merged: NwnMcpConfig = { ...cfg, ...overrides, tools: { ...cfg.tools, ...overrides.tools, nwnx: { ...cfg.tools.nwnx, ...overrides.tools?.nwnx } }, permissions: { ...cfg.permissions, ...overrides.permissions } };
  return {root, tools:createTools(merged), config: merged};
}
describe('tools', () => {
  it('inspects and validates fixture repo', async () => { const {tools}=await fixture(); expect((await tools.inspect()).success).toBe(true); expect((await tools.validateLayout()).success).toBe(true); });
  it('constructs nasher command safely', async () => { const {tools}=await fixture(); await tools.nasherBuild({projectDir:'.', outputMod:'build/dist/x.mod', profile:'dev'}); expect(execa).toHaveBeenCalledWith('nasher', ['pack','module','--profile','dev'], expect.any(Object)); });
  it('parses compiler diagnostics', async () => { const {tools}=await fixture(); const r=await tools.compile({scriptPath:'bad.nss'}); expect(r.success).toBe(false); expect(r.diagnostics[0]).toMatchObject({line:31,column:5,message:'Undeclared identifier: oPC'}); });
  it('finds symbols in scripts', async () => { const {tools}=await fixture(); const r=await tools.findSymbol({symbol:'TestSymbol'}); expect(r.matches[0].file).toBe('src/scripts/inc_test.nss'); });
  it('denies Aurora launch when permission is disabled', async () => { const {tools}=await fixture(); const r=await tools.auroraLaunch({modulePath:'build/dist/x.mod'}); expect(r.success).toBe(false); expect(r.error).toMatch(/disabled/); });

  it('denies NWNX server start and stop when permission is disabled', async () => {
    const {tools}=await fixture();
    await expect(tools.nwnxStartServer()).resolves.toMatchObject({success:false, error:expect.stringMatching(/allowStartServer/)});
    await expect(tools.nwnxStopServer()).resolves.toMatchObject({success:false, error:expect.stringMatching(/allowStartServer/)});
  });
  it('reports missing NWNX directory', async () => {
    const {tools}=await fixture();
    const r=await tools.nwnxCheckInstallation();
    expect(r).toMatchObject({success:false, rootExists:false, serverCommandExists:false});
    await expect(tools.nwnxListPlugins()).resolves.toMatchObject({success:false, plugins:[], error:expect.stringMatching(/does not exist/)});
  });
  it('lists NWNX plugins from the configured root', async () => {
    const {root, tools}=await fixture();
    await mkdir(path.join(root,'external/nwnx/plugins'),{recursive:true});
    await writeFile(path.join(root,'external/nwnx/plugins/NWNX_Events.so'),'');
    await writeFile(path.join(root,'external/nwnx/plugins/readme.txt'),'not a plugin');
    const r=await tools.nwnxListPlugins();
    expect(r.success).toBe(true);
    expect(r.plugins).toEqual([{name:'NWNX_Events', file:'external/nwnx/plugins/NWNX_Events.so'}]);
  });
  it('invokes the configured NWNX server command when server start is allowed', async () => {
    const {root, tools}=await fixture({permissions:{allowInstallToNwnUserDir:false, allowStartServer:true, allowAuroraLaunch:false}});
    await mkdir(path.join(root,'external/nwnx'),{recursive:true});
    await writeFile(path.join(root,'external/nwnx/nwserver'),'#!/bin/sh\n');
    await tools.nwnxStartServer();
    expect(execa).toHaveBeenCalledWith(path.join(root,'external/nwnx/nwserver'), [], expect.objectContaining({cwd:path.join(root,'external/nwnx'), detached:true}));
  });
});
