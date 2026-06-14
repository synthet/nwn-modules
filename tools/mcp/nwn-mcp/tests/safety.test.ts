import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { resolveWorkspacePath, safeArgs } from '../src/safety.js';

describe('path safety', () => {
  const root = path.resolve('/tmp/nwn-project');
  it('allows paths inside workspace', () => expect(resolveWorkspacePath(root, 'src/scripts/a.nss')).toBe(path.join(root, 'src/scripts/a.nss')));
  it('rejects traversal outside workspace', () => expect(() => resolveWorkspacePath(root, '../secret')).toThrow(/escapes workspace/));
  it('rejects NUL paths and args', () => { expect(() => resolveWorkspacePath(root, 'a\0b')).toThrow(/NUL/); expect(() => safeArgs(['a\0b'])).toThrow(/NUL/); });
});
