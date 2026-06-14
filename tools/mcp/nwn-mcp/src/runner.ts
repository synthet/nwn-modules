import { execa, type Options } from 'execa';
export interface CommandResult { success: boolean; command: string; args: string[]; exitCode?: number; stdout: string; stderr: string; error?: string; }
export async function runCommand(command: string, args: string[], options: Options = {}): Promise<CommandResult> {
  try {
    const r = await execa(command, args, { reject: false, all: false, ...options });
    return { success: r.exitCode === 0, command, args, exitCode: r.exitCode, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  } catch (e) {
    const err = e as Error;
    return { success: false, command, args, stdout: '', stderr: '', error: err.message };
  }
}
