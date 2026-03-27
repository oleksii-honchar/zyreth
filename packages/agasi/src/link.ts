import fs from "node:fs";
import path from "node:path";

function symlinkType(): fs.symlink.Type | undefined {
  return process.platform === "win32" ? "junction" : "dir";
}

function resolveLinkTarget(linkPath: string, linkTarget: string): string {
  return path.isAbsolute(linkTarget)
    ? path.resolve(linkTarget)
    : path.resolve(path.dirname(linkPath), linkTarget);
}

export type LinkOutcome =
  | { status: "ok" }
  | { status: "created" }
  | { status: "replaced" }
  | { status: "blocked"; message: string };

export function linkSkillDir(
  sourceSkillDir: string,
  destLinkPath: string,
  opts: { force: boolean },
): LinkOutcome {
  const src = path.resolve(sourceSkillDir);
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    return { status: "blocked", message: `Missing skill directory: ${src}` };
  }

  if (fs.existsSync(destLinkPath)) {
    const st = fs.lstatSync(destLinkPath);
    if (st.isSymbolicLink()) {
      try {
        const cur = fs.readlinkSync(destLinkPath);
        const resolved = resolveLinkTarget(destLinkPath, cur);
        if (path.resolve(resolved) === path.resolve(src)) {
          return { status: "ok" };
        }
        if (!opts.force) {
          return {
            status: "blocked",
            message: `Symlink points elsewhere: ${destLinkPath} -> ${cur}`,
          };
        }
        fs.unlinkSync(destLinkPath);
        fs.symlinkSync(src, destLinkPath, symlinkType());
        return { status: "replaced" };
      } catch {
        if (!opts.force) {
          return {
            status: "blocked",
            message: `Could not read symlink at ${destLinkPath}`,
          };
        }
        fs.unlinkSync(destLinkPath);
        fs.symlinkSync(src, destLinkPath, symlinkType());
        return { status: "replaced" };
      }
    }
    if (st.isDirectory()) {
      return {
        status: "blocked",
        message: `Destination is a real directory (not a symlink): ${destLinkPath}`,
      };
    }
    return {
      status: "blocked",
      message: `Destination exists and is not a symlink: ${destLinkPath}`,
    };
  }

  fs.symlinkSync(src, destLinkPath, symlinkType());
  return { status: "created" };
}

export function pruneStaleSymlinks(
  destBase: string,
  skillsRoot: string,
  validNames: Set<string>,
): number {
  if (!fs.existsSync(destBase)) {
    return 0;
  }
  const rootResolved = path.resolve(skillsRoot);
  let removed = 0;
  for (const name of fs.readdirSync(destBase)) {
    if (validNames.has(name)) {
      continue;
    }
    const p = path.join(destBase, name);
    let st: fs.Stats;
    try {
      st = fs.lstatSync(p);
    } catch {
      continue;
    }
    if (!st.isSymbolicLink()) {
      continue;
    }
    let cur: string;
    try {
      cur = fs.readlinkSync(p);
    } catch {
      continue;
    }
    const resolved = resolveLinkTarget(p, cur);
    const skillPath = path.join(rootResolved, name);
    if (path.resolve(resolved) === path.resolve(skillPath)) {
      fs.unlinkSync(p);
      removed += 1;
    }
  }
  return removed;
}
