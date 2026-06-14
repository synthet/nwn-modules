import { resolve, sep } from "path";

/**
 * Resolves a path relative to workspaceRoot and validates it stays inside.
 * Throws if the resolved path escapes the workspace (path traversal prevention).
 */
export function safePath(workspaceRoot: string, relativePath: string): string {
  const root = resolve(workspaceRoot);
  const resolved = resolve(root, relativePath);

  // Ensure the resolved path starts with the root directory prefix.
  // Use path.sep so Windows backslash paths compare correctly.
  const rootWithSep = root.endsWith(sep) ? root : root + sep;

  if (resolved !== root && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Path traversal rejected: ${relativePath}`);
  }

  return resolved;
}

/**
 * Returns true if the path is safely within the workspace root.
 */
export function isInsideWorkspace(
  workspaceRoot: string,
  targetPath: string
): boolean {
  try {
    safePath(workspaceRoot, targetPath);
    return true;
  } catch {
    return false;
  }
}
