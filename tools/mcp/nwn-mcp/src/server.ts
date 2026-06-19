#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { createTools, schemas } from './tools.js';

const config = await loadConfig();
const tools = createTools(config);
const server = new McpServer({ name: 'nwn-mcp', version: '0.1.0' });
function reg(name:string, description:string, schema:any, fn:(args:any)=>Promise<unknown>) {
  server.tool(name, description, schema.shape ?? {}, async (args:any) => ({ content: [{ type: 'text' as const, text: JSON.stringify(await fn(schema.parse(args)), null, 2) }] }));
}
const none = z.object({});
reg('nwn.project.inspect','Inspect NWN project layout and configured tools.',none,tools.inspect);
reg('nwn.project.validate_layout','Validate required NWN/Nasher project layout.',none,tools.validateLayout);
reg('nwn.project.diff_summary','Summarize Git changes by NWN content concept.',none,tools.diffSummary);
reg('nwn.nasher.build','Run safe Nasher module build.',schemas.build,tools.nasherBuild);
reg('nwn.nasher.validate','Validate source layout and JSON files before Nasher build.',none,tools.nasherValidate);
reg('nwn.nasher.resource_lookup','Find project resources by resref/type.',schemas.lookup,tools.resourceLookup);
reg('nwn.script.compile','Compile one NWScript file.',schemas.compile,tools.compile);
reg('nwn.script.compile_all','Compile all or changed NWScript files.',schemas.compileAll,tools.compileAll);
reg('nwn.script.find_symbol','Find symbols in project NWScript files.',schemas.findSymbol,tools.findSymbol);
reg('nwn.docs.search','Search local project documentation.',schemas.search,tools.docsSearch);
reg('nwn.aurora.launch','Launch Aurora Toolset when explicitly enabled.',schemas.launch,tools.auroraLaunch);
reg('nwn.aurora.snapshot','Create a timestamped module backup.',schemas.snapshot,tools.auroraSnapshot);
reg('nwn.aurora.watch_changes','Scaffold for Toolset save watcher.',none,tools.auroraWatchChanges);
reg('nwn.aurora.import_after_save','Scaffold for Toolset round-trip import.',none,tools.auroraImportAfterSave);
reg('nwn.nwnx.check_installation','Scaffold for NWNX install detection.',none,tools.nwnxCheckInstallation);
reg('nwn.nwnx.list_plugins','Scaffold for NWNX plugin listing.',none,tools.nwnxListPlugins);
reg('nwn.nwnx.start_server','Scaffold for gated NWNX server start.',none,tools.nwnxStartServer);
reg('nwn.nwnx.stop_server','Scaffold for NWNX server stop.',none,tools.nwnxStopServer);
reg('nwn.nwnx.tail_logs','Scaffold for NWNX log tailing.',none,tools.nwnxTailLogs);
reg('nwn.nwnx.run_smoke_test','Scaffold for NWNX smoke tests.',none,tools.nwnxRunSmokeTest);
reg('nwn.assets.index','Scaffold for asset indexing.',none,tools.assetsIndex);
reg('nwn.assets.find_resref','Scaffold for asset resref collision search.',none,tools.assetsFindResref);
reg('nwn.assets.audit_attribution','Scaffold for attribution audit.',none,tools.assetsAuditAttribution);
await server.connect(new StdioServerTransport());
