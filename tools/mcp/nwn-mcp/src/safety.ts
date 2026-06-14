import path from 'node:path';
export class SafetyError extends Error { constructor(message: string) { super(message); this.name = 'SafetyError'; } }
export function resolveWorkspacePath(root: string, input = '.'): string {
  if (input.includes('\0')) throw new SafetyError('Path contains NUL byte.');
  const resolved = path.resolve(root, input);
  const rel = path.relative(root, resolved);
  if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) return resolved;
  throw new SafetyError(`Path escapes workspace: ${input}`);
}
export function toRelative(root: string, abs: string): string { return path.relative(root, abs).split(path.sep).join('/'); }
export function safeArgs(args: string[]): string[] { return args.map(a => { if (a.includes('\0')) throw new SafetyError('Argument contains NUL byte.'); return a; }); }
