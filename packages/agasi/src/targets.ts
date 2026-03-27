import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AgasiConfig, DestinationEntry, TargetEntry } from "./config.js";
import { findSource, needsRepoRoot, validateTargetForInstall } from "./config.js";

export type ResolvedDestination = {
  label: string;
  baseDir: string;
};

function codexSkillsDir(): string {
  const home = os.homedir();
  const fromEnv = process.env.CODEX_HOME?.trim();
  if (fromEnv) {
    return path.join(fromEnv, "skills");
  }
  return path.join(home, ".codex", "skills");
}

export function resolveDestinations(
  cfg: AgasiConfig,
  target: TargetEntry,
): ResolvedDestination[] {
  const err = validateTargetForInstall(target);
  if (err) {
    throw new Error(err);
  }
  const repoRoot = target.repoRoot?.trim()
    ? path.resolve(target.repoRoot.trim())
    : null;
  const out: ResolvedDestination[] = [];
  for (const d of target.destinations) {
    if (d.type === "cursor") {
      if (!repoRoot) {
        throw new Error(`Target "${target.id}": cursor destination requires repoRoot`);
      }
      out.push({
        label: "cursor",
        baseDir: path.join(repoRoot, ".cursor", "skills"),
      });
    } else if (d.type === "agents") {
      if (!repoRoot) {
        throw new Error(`Target "${target.id}": agents destination requires repoRoot`);
      }
      out.push({
        label: "agents",
        baseDir: path.join(repoRoot, ".agents", "skills"),
      });
    } else if (d.type === "codex") {
      out.push({
        label: "codex",
        baseDir: codexSkillsDir(),
      });
    } else if (d.type === "path") {
      if (!repoRoot) {
        throw new Error(`Target "${target.id}": path destination requires repoRoot`);
      }
      out.push({
        label: `path:${d.relative}`,
        baseDir: path.join(repoRoot, d.relative),
      });
    }
  }
  return out;
}

export function resolveSkillsRoot(cfg: AgasiConfig, target: TargetEntry): string {
  const src = findSource(cfg, target.source);
  if (!src) {
    throw new Error(`Unknown source "${target.source}" for target "${target.id}"`);
  }
  return path.resolve(src.path);
}

export function ensureBaseParentDirs(baseDir: string): void {
  fs.mkdirSync(baseDir, { recursive: true });
}

export function targetNeedsRepoRoot(target: TargetEntry): boolean {
  return target.destinations.some(needsRepoRoot);
}
