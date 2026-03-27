import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const TASKASI_CONFIG_DIR = path.join(os.homedir(), ".taskasi");
export const TASKASI_CONFIG_PATH = path.join(TASKASI_CONFIG_DIR, "config.yaml");

/**
 * Absolute path to global config file. Override with env `TASKASI_CONFIG_PATH` (tests, sandboxes).
 */
export function getTaskasiConfigPath(): string {
  const override = process.env.TASKASI_CONFIG_PATH?.trim();
  if (override) {
    return path.resolve(override);
  }
  return TASKASI_CONFIG_PATH;
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function expandPlaceholders(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

export function posixRelative(fromDir: string, toTarget: string): string {
  const rel = path.relative(fromDir, toTarget);
  return rel.split(path.sep).join("/");
}
