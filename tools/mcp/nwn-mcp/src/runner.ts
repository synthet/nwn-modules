import path from 'node:path';
import { execa, type Options } from 'execa';

export interface CommandResult { success: boolean; command: string; args: string[]; exitCode?: number; stdout: string; stderr: string; error?: string; }

function pathWithToolsBin(): Record<string, string> | undefined {
  const toolsRoot = process.env.NWN_TOOLS;
  if (!toolsRoot) return undefined;
  const bin = path.join(path.resolve(toolsRoot), 'bin');
  const sep = process.platform === 'win32' ? ';' : ':';
  return { PATH: `${bin}${sep}${process.env.PATH ?? ''}` };
}

export async function runCommand(command: string, args: string[], options: Options = {}): Promise<CommandResult> {
  try {
    const toolEnv = pathWithToolsBin();
    const r = await execa(command, args, { reject: false, all: false, env: { ...process.env, ...toolEnv, ...options.env }, ...options });
    return { success: r.exitCode === 0, command, args, exitCode: r.exitCode, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  } catch (e) {
    const err = e as Error;
    return { success: false, command, args, stdout: '', stderr: '', error: err.message };
  }
}
