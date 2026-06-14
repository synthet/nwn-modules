/**
 * Unit tests for path safety utilities.
 *
 * These tests run via jest (see package.json) and verify that safePath()
 * correctly rejects path traversal attempts while allowing valid relative paths.
 */

import { safePath, isInsideWorkspace } from "../utils/paths.js";
import { resolve } from "path";

const WORKSPACE = "/tmp/test-workspace";

describe("safePath", () => {
  it("allows a valid relative path inside the workspace", () => {
    const result = safePath(WORKSPACE, "src/scripts/my_script.nss");
    expect(result).toBe(resolve(WORKSPACE, "src/scripts/my_script.nss"));
  });

  it("allows a nested valid path", () => {
    const result = safePath(WORKSPACE, "tools/testing/script-tests/test_foo.py");
    expect(result).toBe(
      resolve(WORKSPACE, "tools/testing/script-tests/test_foo.py")
    );
  });

  it("allows the workspace root itself", () => {
    const result = safePath(WORKSPACE, ".");
    expect(result).toBe(resolve(WORKSPACE));
  });

  it("rejects ../etc/passwd style traversal", () => {
    expect(() => safePath(WORKSPACE, "../etc/passwd")).toThrow(
      /path traversal rejected/i
    );
  });

  it("rejects deep traversal that escapes the workspace", () => {
    expect(() =>
      safePath(WORKSPACE, "src/../../etc/shadow")
    ).toThrow(/path traversal rejected/i);
  });

  it("rejects an absolute path outside the workspace", () => {
    expect(() => safePath(WORKSPACE, "/etc/passwd")).toThrow(
      /path traversal rejected/i
    );
  });

  it("rejects an absolute path that is a sibling of the workspace", () => {
    // e.g. workspace is /tmp/test-workspace, sibling is /tmp/test-workspace-evil
    expect(() =>
      safePath(WORKSPACE, "/tmp/test-workspace-evil/file.txt")
    ).toThrow(/path traversal rejected/i);
  });
});

describe("isInsideWorkspace", () => {
  it("returns true for a valid path inside the workspace", () => {
    expect(isInsideWorkspace(WORKSPACE, "src/scripts/foo.nss")).toBe(true);
  });

  it("returns false for a path outside the workspace", () => {
    expect(isInsideWorkspace(WORKSPACE, "../etc/passwd")).toBe(false);
  });

  it("returns false for an absolute path outside the workspace", () => {
    expect(isInsideWorkspace(WORKSPACE, "/etc/passwd")).toBe(false);
  });

  it("returns true for the workspace root itself", () => {
    expect(isInsideWorkspace(WORKSPACE, ".")).toBe(true);
  });
});
