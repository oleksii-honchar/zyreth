import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
/** Writable under package (works in restricted CI sandboxes that block system temp). */
export const testTmpRoot = path.join(testDir, ".tmp");

export function mkTestTmp(prefix) {
  fs.mkdirSync(testTmpRoot, { recursive: true });
  return fs.mkdtempSync(path.join(testTmpRoot, prefix));
}

export function rmTestTmp(absPath) {
  try {
    fs.rmSync(absPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
