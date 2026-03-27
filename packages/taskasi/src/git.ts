import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function getGitRoot(cwd: string): string {
  const out = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf-8",
  }).trim();
  if (!out) {
    throw new Error("Could not resolve git repository root");
  }
  return out;
}

export function localBranchExists(repoRoot: string, branch: string): boolean {
  try {
    execFileSync("git", ["show-ref", "--verify", `refs/heads/${branch}`], {
      cwd: repoRoot,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

export type GitWorktreeStdio = "inherit" | "pipe" | "ignore";

export function addWorktree(
  repoRoot: string,
  worktreePath: string,
  branch: string,
  options?: { stdio?: GitWorktreeStdio },
): void {
  const stdio = options?.stdio ?? "inherit";
  fs.mkdirSync(path.dirname(worktreePath), { recursive: true });
  const exists = localBranchExists(repoRoot, branch);
  if (exists) {
    execFileSync("git", ["worktree", "add", worktreePath, branch], {
      cwd: repoRoot,
      stdio,
    });
  } else {
    execFileSync("git", ["worktree", "add", "-b", branch, worktreePath], {
      cwd: repoRoot,
      stdio,
    });
  }
}
