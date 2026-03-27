import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const AGASI_CONFIG_DIR = path.join(os.homedir(), ".agasi");
export const AGASI_CONFIG_PATH = path.join(AGASI_CONFIG_DIR, "config.yaml");
export const AGASI_CACHE_DIR = path.join(AGASI_CONFIG_DIR, "cache");

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function expandHome(p: string): string {
  const trimmed = p.trim();
  if (trimmed === "~" || trimmed.startsWith("~/")) {
    return path.join(os.homedir(), trimmed.slice(1).replace(/^\//, ""));
  }
  return path.resolve(trimmed);
}
