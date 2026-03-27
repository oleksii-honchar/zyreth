import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_SKIP_DIR_NAMES = [
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".nx",
  ".turbo",
] as const;

/** `.env`, `.env.local`, `.env.dev`, `.env.tpl`, etc. — not `foo.env` (handled via gitignore). */
export function isStandardDotenvBasename(basename: string): boolean {
  return basename === ".env" || basename.startsWith(".env.");
}

/**
 * True if a .gitignore rule line (pattern) is treating this as an env-style file.
 * Avoid matching unrelated rules (e.g. `.envrc` pattern should not match `.env` substring loosely).
 */
export function patternLooksEnvRelated(pattern: string): boolean {
  const p = pattern.trim().toLowerCase().replace(/\\/g, "/");
  if (p === ".env") return true;
  if (p.startsWith(".env.")) return true;
  if (p.startsWith(".env*")) return true;
  if (p.includes(".env.*")) return true;
  if (p.includes("*.env")) return true;
  if (p.includes("/.env")) return true;
  if (p.endsWith("/.env")) return true;
  if (p.endsWith(".env")) return true;
  if (p.includes("**") && p.includes(".env")) return true;
  return false;
}

function parseCheckIgnoreVerboseLine(
  line: string,
): { pattern: string; pathname: string } | undefined {
  const tab = line.lastIndexOf("\t");
  if (tab < 0) return undefined;
  const pathname = line.slice(tab + 1).trim();
  const meta = line.slice(0, tab);
  const m = /^([^:]+):(\d+):(.*)$/.exec(meta);
  if (!m) return undefined;
  return { pattern: m[3], pathname };
}

/**
 * For relative paths (posix), returns paths that are ignored by git with an env-related pattern.
 */
export function batchEnvRelatedIgnoredPaths(
  repoRoot: string,
  relPosixPaths: string[],
): Set<string> {
  const matched = new Set<string>();
  if (relPosixPaths.length === 0) {
    return matched;
  }

  const chunkSize = 8000;
  for (let i = 0; i < relPosixPaths.length; i += chunkSize) {
    const slice = relPosixPaths.slice(i, i + chunkSize);
    const input = `${slice.join("\n")}\n`;
    const r = spawnSync("git", ["check-ignore", "-v", "--stdin"], {
      cwd: repoRoot,
      input,
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (r.error) {
      throw r.error;
    }
    if (r.status === 128 || r.status === null) {
      throw new Error(
        `git check-ignore failed (${r.status}): ${r.stderr?.trim() || "unknown error"}`,
      );
    }
    // status 0: at least one path ignored; 1: none ignored — both may still print matches on stdout for 0 only
    const out = r.stdout?.trim();
    if (!out) continue;
    for (const line of out.split("\n")) {
      if (!line) continue;
      const parsed = parseCheckIgnoreVerboseLine(line);
      if (!parsed) continue;
      if (!patternLooksEnvRelated(parsed.pattern)) continue;
      const norm = parsed.pathname.replace(/\\/g, "/");
      matched.add(norm);
    }
  }
  return matched;
}

function walkCollectRelFiles(
  dir: string,
  repoRoot: string,
  skipDirs: Set<string>,
  out: string[],
): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (skipDirs.has(ent.name)) {
        continue;
      }
      walkCollectRelFiles(full, repoRoot, skipDirs, out);
    } else if (ent.isFile()) {
      const rel = path.relative(repoRoot, full);
      if (rel.startsWith("..")) continue;
      out.push(rel.split(path.sep).join("/"));
    }
  }
}

export function findEnvFilesInRepo(
  repoRoot: string,
  options: {
    worktreeRelativeDir: string;
    extraSkipDirs?: string[];
    /** Extra basenames to always mirror (e.g. `.envrc`). */
    extraBasenames?: string[];
    /** If true (default), also copy non–dotenv names ignored by env-like gitignore rules (e.g. `*.env`). */
    useGitignoreHints?: boolean;
  },
): string[] {
  const resolvedRoot = path.resolve(repoRoot);
  const skipDirs = new Set<string>([
    ...DEFAULT_SKIP_DIR_NAMES,
    options.worktreeRelativeDir,
    ...(options.extraSkipDirs ?? []),
  ]);

  const relFiles: string[] = [];
  walkCollectRelFiles(resolvedRoot, resolvedRoot, skipDirs, relFiles);

  const extra = new Set(options.extraBasenames ?? []);
  const useHints = options.useGitignoreHints !== false;

  const toCopy = new Set<string>();
  const forGitCheck: string[] = [];

  for (const relPosix of relFiles) {
    const base = path.posix.basename(relPosix);
    if (isStandardDotenvBasename(base) || extra.has(base)) {
      toCopy.add(relPosix);
      continue;
    }
    if (useHints && base.endsWith(".env") && base !== ".env") {
      forGitCheck.push(relPosix);
    }
  }

  if (useHints && forGitCheck.length > 0) {
    const ignored = batchEnvRelatedIgnoredPaths(resolvedRoot, forGitCheck);
    for (const p of ignored) {
      toCopy.add(p);
    }
  }

  const abs = [...toCopy]
    .sort()
    .map((rel) => path.join(resolvedRoot, ...rel.split("/")));
  return abs;
}

export function mirrorEnvFilesToWorktree(
  repoRoot: string,
  worktreePath: string,
  sources: string[],
): number {
  const root = path.resolve(repoRoot);
  const wt = path.resolve(worktreePath);
  let n = 0;
  for (const absSrc of sources) {
    const rel = path.relative(root, path.resolve(absSrc));
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      continue;
    }
    const dest = path.join(wt, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(absSrc, dest);
    n += 1;
    console.log(`taskasi: env mirrored ${rel.split(path.sep).join("/")}`);
  }
  return n;
}
