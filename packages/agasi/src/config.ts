import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { AGASI_CONFIG_PATH, ensureDir, expandHome } from "./paths.js";

export type DestinationEntry =
  | { type: "cursor" }
  | { type: "agents" }
  | { type: "codex" }
  | { type: "path"; relative: string };

export type TargetEntry = {
  id: string;
  source: string;
  repoRoot?: string | null;
  destinations: DestinationEntry[];
};

export type SourceEntry = {
  name: string;
  path: string;
};

export type AgasiConfig = {
  version: number;
  sources: SourceEntry[];
  targets: TargetEntry[];
};

const DEFAULTS: AgasiConfig = {
  version: 1,
  sources: [],
  targets: [],
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return base;
  }
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export function defaultConfigYaml(): string {
  return YAML.stringify(
    {
      version: DEFAULTS.version,
      sources: DEFAULTS.sources,
      targets: DEFAULTS.targets,
    },
    { lineWidth: 0 },
  );
}

export function initConfigFile(configPath: string = AGASI_CONFIG_PATH): void {
  const dir = path.dirname(configPath);
  ensureDir(dir);
  if (fs.existsSync(configPath)) {
    return;
  }
  fs.writeFileSync(configPath, defaultConfigYaml(), "utf-8");
}

function normalizeDestinations(raw: unknown): DestinationEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: DestinationEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;
    const t = o.type;
    if (t === "cursor" || t === "agents" || t === "codex") {
      out.push({ type: t });
    } else if (t === "path") {
      const rel = typeof o.relative === "string" ? o.relative : "";
      if (!rel.trim()) {
        throw new Error('Destination type "path" requires non-empty "relative"');
      }
      out.push({ type: "path", relative: rel.replace(/\\/g, "/") });
    }
  }
  return out;
}

function normalizeSources(raw: unknown): SourceEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: SourceEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const p = typeof o.path === "string" ? o.path.trim() : "";
    const hasGit = o.git !== undefined && o.git !== null;
    if (!name) {
      throw new Error("Each source must have a non-empty name");
    }
    if (!p) {
      if (hasGit) {
        throw new Error(
          `Source "${name}" is git-backed (phase 2); this agasi version supports local paths only. Use path: or upgrade when fetch is available.`,
        );
      }
      throw new Error(`Source "${name}" must declare path (local skills root)`);
    }
    out.push({ name, path: expandHome(p) });
  }
  return out;
}

function normalizeTargets(raw: unknown): TargetEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: TargetEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const source = typeof o.source === "string" ? o.source.trim() : "";
    const repoRoot =
      o.repoRoot === null || o.repoRoot === undefined
        ? null
        : typeof o.repoRoot === "string"
          ? o.repoRoot.trim() || null
          : null;
    if (!id) {
      throw new Error("Each target must have a non-empty id");
    }
    if (!source) {
      throw new Error(`Target "${id}" must reference a source name`);
    }
    const destinations = normalizeDestinations(o.destinations);
    if (destinations.length === 0) {
      throw new Error(`Target "${id}" must declare at least one destination`);
    }
    out.push({
      id,
      source,
      repoRoot,
      destinations,
    });
  }
  return out;
}

export function loadConfig(configPath: string = AGASI_CONFIG_PATH): AgasiConfig {
  if (!fs.existsSync(configPath)) {
    return {
      version: DEFAULTS.version,
      sources: [],
      targets: [],
    };
  }
  const rawFile = fs.readFileSync(configPath, "utf-8");
  const parsed = YAML.parse(rawFile) as unknown;
  const merged = deepMerge(
    {
      version: DEFAULTS.version,
      sources: [],
      targets: [],
    } as Record<string, unknown>,
    parsed,
  );
  const sources = normalizeSources(merged.sources);
  const targets = normalizeTargets(merged.targets);
  const version = typeof merged.version === "number" ? merged.version : 1;
  return { version, sources, targets };
}

export function saveConfig(configPath: string, cfg: AgasiConfig): void {
  ensureDir(path.dirname(configPath));
  const doc = {
    version: cfg.version,
    sources: cfg.sources.map((s) => ({ name: s.name, path: s.path })),
    targets: cfg.targets.map((t) => ({
      id: t.id,
      source: t.source,
      repoRoot: t.repoRoot ?? "",
      destinations: t.destinations,
    })),
  };
  fs.writeFileSync(configPath, YAML.stringify(doc, { lineWidth: 0 }), "utf-8");
}

export function assertSourcePathsExist(cfg: AgasiConfig): void {
  for (const s of cfg.sources) {
    if (!fs.existsSync(s.path)) {
      throw new Error(`Source "${s.name}" path does not exist: ${s.path}`);
    }
    if (!fs.statSync(s.path).isDirectory()) {
      throw new Error(`Source "${s.name}" path is not a directory: ${s.path}`);
    }
  }
}

export function findSource(cfg: AgasiConfig, name: string): SourceEntry | undefined {
  return cfg.sources.find((s) => s.name === name);
}

export function targetReferencesSource(cfg: AgasiConfig, sourceName: string): boolean {
  return cfg.targets.some((t) => t.source === sourceName);
}

export function needsRepoRoot(d: DestinationEntry): boolean {
  return d.type === "cursor" || d.type === "agents" || d.type === "path";
}

export function validateTargetForInstall(t: TargetEntry): string | undefined {
  const needs = t.destinations.some(needsRepoRoot);
  if (needs && (!t.repoRoot || !t.repoRoot.trim())) {
    return `Target "${t.id}" needs repoRoot for non-codex destinations`;
  }
  return undefined;
}
