import { access, mkdir, readdir, readFile, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import simpleGit from 'simple-git';
import { z } from 'zod';
import { NwnMcpConfig } from './config.js';
import { resolveWorkspacePath, safeArgs, toRelative } from './safety.js';
import { runCommand } from './runner.js';

const empty = z.object({}).default({});
const exists = async (p:string) => access(p).then(()=>true).catch(()=>false);
export const schemas = {
  path: z.object({ path: z.string() }),
  build: z.object({ projectDir: z.string().default('.'), outputMod: z.string().default('dist/module.mod'), profile: z.string().optional() }),
  lookup: z.object({ resref: z.string().min(1), type: z.string().optional() }),
  compile: z.object({ scriptPath: z.string() }),
  compileAll: z.object({ changedOnly: z.boolean().default(false) }),
  findSymbol: z.object({ symbol: z.string().min(1) }),
  search: z.object({ query: z.string().min(1), limit: z.number().int().positive().max(50).default(10) }),
  launch: z.object({ modulePath: z.string() }),
  snapshot: z.object({ modulePath: z.string(), label: z.string().regex(/^[A-Za-z0-9._-]+$/).default('snapshot') })
};
export function createTools(config: NwnMcpConfig) {
  const root = config.resolvedWorkspaceRoot;
  const git = simpleGit(root);
  async function inspect() {
    const p = config.paths;
    return { success: true, projectRoot: root, nasherConfig: await exists(path.join(root,'nasher.cfg')) ? 'nasher.cfg' : null,
      folders: { moduleSource: p.moduleSource, scripts: p.scripts, docs: p.docs, hakSource: p.hakSource, dist: p.dist, build: p.build }, tools: config.tools, permissions: config.permissions };
  }
  async function validateLayout() {
    const required = ['nasher.cfg', config.paths.moduleSource, config.paths.scripts, config.paths.docs];
    const missing = (await Promise.all(required.map(async r => [r, !(await exists(resolveWorkspacePath(root,r)))] as const))).filter(([,m])=>m).map(([r])=>r);
    const gitignore = await readFile(path.join(root,'.gitignore'),'utf8').catch(()=> '');
    const gitignoreProblems = ['build','dist','*.mod','*.hak','*.tlk'].filter(x=>!gitignore.includes(x));
    const docsMissing = (await Promise.all(['docs/ATTRIBUTION.md','docs/BUILD.md'].map(async r=>[r,!(await exists(resolveWorkspacePath(root,r)))] as const))).filter(([,m])=>m).map(([r])=>r);
    const tracked = await git.raw(['ls-files']);
    const binaryTracked = tracked.split('\n').filter(f=>/\.(mod|hak|tlk|erf)$/i.test(f));
    return { success: missing.length+gitignoreProblems.length+docsMissing.length+binaryTracked.length===0, missing, gitignoreProblems, docsMissing, binaryTracked };
  }
  function group(files:string[]) { const out: Record<string,string[]> = {scripts:[],dialogs:[],areas:[],creatures:[],items:[],assets:[],docs:[],other:[]}; for (const f of files) { if (/\.nss$/i.test(f)) out.scripts.push(f); else if (/dialogs|\.dlg\.json$/i.test(f)) out.dialogs.push(f); else if (/areas|\.(are|git|gic)\.json$/i.test(f)) out.areas.push(f); else if (/creatures|\.utc\.json$/i.test(f)) out.creatures.push(f); else if (/items|\.uti\.json$/i.test(f)) out.items.push(f); else if (/^(hak|external|art)|\.(2da|tga|dds|mdl|erf)$/i.test(f)) out.assets.push(f); else if (/^docs\//.test(f) || /README|DESIGN|CONTRIBUTING/.test(f)) out.docs.push(f); else out.other.push(f); } return out; }
  async function diffSummary() { const s = await git.status(); return { success: true, summary: group([...s.modified,...s.created,...s.deleted,...s.renamed.map(r=>r.to)]) }; }
  async function nasherBuild(input: z.infer<typeof schemas.build>) { const cwd = resolveWorkspacePath(root,input.projectDir); const out = resolveWorkspacePath(root,input.outputMod); const args = safeArgs(['pack','module']); if (input.profile) args.push('--profile', input.profile); const r = await runCommand(config.tools.nasher.command,args,{cwd}); return { ...r, generatedModulePath: toRelative(root,out), diagnostics: parseDiagnostics(r.stderr + '\n' + r.stdout) }; }
  async function nasherValidate() { const layout = await validateLayout(); const jsonFiles = await fg(['**/*.json'],{cwd:root,ignore:['node_modules/**','tools/mcp/nwn-mcp/node_modules/**']}); const malformed=[]; for (const f of jsonFiles) try { JSON.parse(await readFile(path.join(root,f),'utf8')); } catch(e) { malformed.push({file:f,message:(e as Error).message}); } return { success: layout.success && malformed.length===0, layout, malformedJson: malformed }; }
  async function resourceLookup(input:z.infer<typeof schemas.lookup>) { const files = await fg([`**/${input.resref}*${input.type?'.'+input.type:''}*`],{cwd:root,ignore:['node_modules/**','build/**']}); return { success:true, matches: files }; }
  function parseDiagnostics(text:string) { return text.split('\n').map(l=>{ const m=l.match(/(.+?\.nss)[:(](\d+)[,:)]\s*(?:(\d+)[:,)]\s*)?(error|warning)?\s*:?\s*(.+)/i); return m?{file:m[1],line:Number(m[2]),column:m[3]?Number(m[3]):1,severity:(m[4]?.toLowerCase()==='warning'?'warning':'error'),message:m[5]}:null; }).filter(Boolean); }
  async function compile(input:z.infer<typeof schemas.compile>) { const sp = resolveWorkspacePath(root,input.scriptPath); const r = await runCommand(config.tools.nwscriptCompiler.command,safeArgs([sp]),{cwd:root}); return { ...r, diagnostics: parseDiagnostics(r.stderr+'\n'+r.stdout) }; }
  async function compileAll(input:z.infer<typeof schemas.compileAll>) { let files = input.changedOnly ? (await git.status()).modified.filter(f=>/\.nss$/i.test(f)) : await fg([`${config.paths.scripts}/**/*.nss`],{cwd:root}); const results=[]; for (const f of files) results.push(await compile({scriptPath:f})); const diagnostics = results.flatMap(r=>r.diagnostics); return { success: results.every(r=>r.success), compiled: results.length, failed: results.filter(r=>!r.success).length, diagnostics }; }
  async function findSymbol(input:z.infer<typeof schemas.findSymbol>) { const files = await fg([`${config.paths.scripts}/**/*.nss`],{cwd:root}); const matches: Array<{file:string;line:number;text:string}> = []; for (const f of files) { const lines=(await readFile(path.join(root,f),'utf8')).split('\n'); lines.forEach((line: string,i: number)=>{ if (line.includes(input.symbol)) matches.push({file:f,line:i+1,text:line.trim()}); }); } return { success:true, matches }; }
  async function docsSearch(input:z.infer<typeof schemas.search>) { const files = await fg([`${config.paths.docs}/**/*.{md,txt}`, 'README.md','DESIGN.md','CONTRIBUTING.md'],{cwd:root}); const q=input.query.toLowerCase(), matches: Array<{file:string;line:number;text:string}> = []; for (const f of files) { const lines=(await readFile(path.join(root,f),'utf8')).split('\n'); lines.forEach((line: string,i: number)=>{ if (line.toLowerCase().includes(q) && matches.length<input.limit) matches.push({file:f,line:i+1,text:line.trim()}); }); } return { success:true, matches }; }
  async function auroraLaunch(input:z.infer<typeof schemas.launch>) { if (!config.permissions.allowAuroraLaunch) return { success:false,error:'Aurora launch is disabled by permissions.allowAuroraLaunch.'}; const mp=resolveWorkspacePath(root,input.modulePath); return runCommand(config.tools.auroraToolset.command,safeArgs([mp]),{cwd:root,detached:true}); }
  async function auroraSnapshot(input:z.infer<typeof schemas.snapshot>) { const mp=resolveWorkspacePath(root,input.modulePath); await stat(mp); const dir=path.join(root,config.paths.build,'snapshots'); await mkdir(dir,{recursive:true}); const ext=path.extname(mp); const dest=path.join(dir,`${path.basename(mp,ext)}-${new Date().toISOString().replace(/[:.]/g,'-')}-${input.label}${ext}`); await copyFile(mp,dest); return { success:true, snapshot:toRelative(root,dest) }; }
  const scaffold = (name:string) => async () => ({ success:false, implemented:false, tool:name, error:'Scaffold only in MVP; intentionally not implemented yet.' });
  return { inspect, validateLayout, diffSummary, nasherBuild, nasherValidate, resourceLookup, compile, compileAll, findSymbol, docsSearch, auroraLaunch, auroraSnapshot,
    auroraWatchChanges: scaffold('nwn.aurora.watch_changes'), auroraImportAfterSave: scaffold('nwn.aurora.import_after_save'), nwnxCheckInstallation: scaffold('nwn.nwnx.check_installation'), nwnxListPlugins: scaffold('nwn.nwnx.list_plugins'), nwnxStartServer: scaffold('nwn.nwnx.start_server'), nwnxStopServer: scaffold('nwn.nwnx.stop_server'), nwnxTailLogs: scaffold('nwn.nwnx.tail_logs'), nwnxRunSmokeTest: scaffold('nwn.nwnx.run_smoke_test'), assetsIndex: scaffold('nwn.assets.index'), assetsFindResref: scaffold('nwn.assets.find_resref'), assetsAuditAttribution: scaffold('nwn.assets.audit_attribution') };
}
export const emptySchema = empty;
