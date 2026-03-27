import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { ensureDir, expandPlaceholders, getTaskasiConfigPath } from "./paths.js";

export type TaskasiConfig = {
  branchPrefix: string;
  worktreeRelativeDir: string;
  worktreeFolderTemplate: string;
  env: {
    enabled: boolean;
    /** If set, copy only this file into the worktree root as `.env` (legacy). If unset, discover env files (see README). */
    source: string | undefined;
    /** Extra basenames to always mirror (exact match), in addition to `.env` / `.env.*`. */
    fileNames: string[] | undefined;
    /** If true (default), also copy files ignored by gitignore when the matching rule looks env-related (e.g. `*.env`). */
    useGitignoreHints: boolean | undefined;
    /** Extra directory names to skip when walking (always skips `.git`, `node_modules`, `dist`, etc., and `worktreeRelativeDir`). */
    skipDirs: string[] | undefined;
  };
  workspace: {
    enabled: boolean;
    source: string | undefined;
    output: string | undefined;
    gitignore: { enabled: boolean };
  };
};

const DEFAULTS: TaskasiConfig = {
  branchPrefix: "NWDEXP-",
  worktreeRelativeDir: ".worktrees",
  worktreeFolderTemplate: "{branch}",
  env: {
    enabled: true,
    source: undefined,
    fileNames: undefined,
    useGitignoreHints: true,
    skipDirs: undefined,
  },
  workspace: {
    enabled: true,
    source: undefined,
    output: undefined,
    gitignore: { enabled: true },
  },
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
      branchPrefix: DEFAULTS.branchPrefix,
      worktreeRelativeDir: DEFAULTS.worktreeRelativeDir,
      worktreeFolderTemplate: DEFAULTS.worktreeFolderTemplate,
      env: { enabled: true },
      workspace: { enabled: true, gitignore: { enabled: true } },
    },
    { lineWidth: 0 },
  );
}

export function initConfigFile(): void {
  const configPath = getTaskasiConfigPath();
  ensureDir(path.dirname(configPath));
  if (fs.existsSync(configPath)) {
    return;
  }
  fs.writeFileSync(configPath, defaultConfigYaml(), "utf-8");
}

export function loadConfig(): TaskasiConfig {
  const configPath = getTaskasiConfigPath();
  if (!fs.existsSync(configPath)) {
    return {
      ...DEFAULTS,
      env: { ...DEFAULTS.env },
      workspace: {
        ...DEFAULTS.workspace,
        gitignore: { ...DEFAULTS.workspace.gitignore },
      },
    };
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = YAML.parse(raw) as unknown;
  const merged = deepMerge(
    {
      ...DEFAULTS,
      env: { ...DEFAULTS.env },
      workspace: {
        ...DEFAULTS.workspace,
        gitignore: { ...DEFAULTS.workspace.gitignore },
      },
    } as Record<string, unknown>,
    parsed,
  );
  return merged as TaskasiConfig;
}

export type PathContext = {
  repoRoot: string;
  parent: string;
  basename: string;
  id: string;
  branch: string;
  prefix: string;
  prefixLower: string;
};

export function buildPathContext(repoRoot: string, id: string, cfg: TaskasiConfig): PathContext {
  const prefix = cfg.branchPrefix;
  const branch = `${prefix}${id}`;
  return {
    repoRoot: path.resolve(repoRoot),
    parent: path.dirname(path.resolve(repoRoot)),
    basename: path.basename(path.resolve(repoRoot)),
    id,
    branch,
    prefix,
    prefixLower: prefix.toLowerCase(),
  };
}

export function pathVars(ctx: PathContext): Record<string, string> {
  return {
    repo: ctx.repoRoot,
    parent: ctx.parent,
    basename: ctx.basename,
    id: ctx.id,
    branch: ctx.branch,
    prefix: ctx.prefix,
    prefixLower: ctx.prefixLower,
  };
}

export function resolveWorktreeFolder(cfg: TaskasiConfig, ctx: PathContext): string {
  const raw = expandPlaceholders(cfg.worktreeFolderTemplate, pathVars(ctx));
  return sanitizePathSegment(raw);
}

function sanitizePathSegment(name: string): string {
  const cleaned = name.replace(/[/\\]/g, "-").replace(/^\.+/, "");
  if (!cleaned) {
    throw new Error("Resolved worktree folder name is empty; check worktreeFolderTemplate");
  }
  return cleaned;
}

export function resolveEnvSource(cfg: TaskasiConfig, ctx: PathContext): string {
  const relOrAbs =
    cfg.env.source?.trim() ||
    path.join(ctx.repoRoot, ".env");
  return path.isAbsolute(relOrAbs)
    ? relOrAbs
    : path.resolve(ctx.repoRoot, relOrAbs);
}

export function resolveWorkspaceSource(cfg: TaskasiConfig, ctx: PathContext): string | undefined {
  if (cfg.workspace.source?.trim()) {
    const p = expandPlaceholders(cfg.workspace.source.trim(), pathVars(ctx));
    return path.isAbsolute(p) ? p : path.resolve(ctx.repoRoot, p);
  }
  const candidates = [
    path.join(ctx.repoRoot, `${ctx.basename}.code-workspace`),
    path.join(ctx.repoRoot, `${ctx.basename}.workspace`),
    path.join(ctx.parent, `${ctx.basename}.code-workspace`),
    path.join(ctx.parent, `${ctx.basename}.workspace`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return undefined;
}

export function resolveWorkspaceOutput(cfg: TaskasiConfig, ctx: PathContext): string {
  const pattern =
    cfg.workspace.output?.trim() || "{basename}-{id}.workspace";
  const expanded = expandPlaceholders(pattern, pathVars(ctx));
  return path.isAbsolute(expanded)
    ? expanded
    : path.resolve(ctx.repoRoot, expanded);
}
