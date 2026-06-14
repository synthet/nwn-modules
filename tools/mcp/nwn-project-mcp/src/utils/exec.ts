import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs = 30000
): Promise<ExecResult> {
  const start = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      timeout: timeoutMs,
      env: process.env,
    });
    return {
      stdout: stdout ?? "",
      stderr: stderr ?? "",
      exitCode: 0,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number | string;
    };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? String(err),
      exitCode: typeof e.code === "number" ? e.code : 1,
      durationMs: Date.now() - start,
    };
  }
}

export interface ToolResponse {
  ok: boolean;
  tool: string;
  durationMs: number;
  stdout: string;
  stderr: string;
  artifacts: string[];
  error?: string;
  data?: unknown;
}

export function makeResponse(
  tool: string,
  result: ExecResult,
  success: boolean,
  extras?: Partial<ToolResponse>
): ToolResponse {
  return {
    ok: success,
    tool,
    durationMs: result.durationMs,
    stdout: result.stdout,
    stderr: result.stderr,
    artifacts: [],
    ...extras,
  };
}
