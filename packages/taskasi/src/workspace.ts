import fs from "node:fs";
import path from "node:path";
import { posixRelative } from "./paths.js";

type VsCodeWorkspace = {
  folders?: Array<{ name?: string; path: string }>;
  settings?: unknown;
  [key: string]: unknown;
};

function shouldPreservePath(p: string): boolean {
  if (path.isAbsolute(p)) {
    return true;
  }
  const posix = p.split("\\").join("/");
  return posix.startsWith("../") || posix === "..";
}

export function rewriteWorkspaceFolders(
  workspace: VsCodeWorkspace,
  outputFileAbs: string,
  worktreeAbs: string,
): VsCodeWorkspace {
  const outDir = path.dirname(path.resolve(outputFileAbs));
  const wt = path.resolve(worktreeAbs);
  const folders = workspace.folders;
  if (!Array.isArray(folders)) {
    throw new Error("Workspace JSON has no folders array");
  }
  const nextFolders = folders.map((f) => {
    const raw = f.path;
    if (typeof raw !== "string") {
      throw new Error("Workspace folder entry missing string path");
    }
    const trimmed = raw.trim();
    if (shouldPreservePath(trimmed)) {
      return f;
    }
    if (trimmed === "." || trimmed === "./") {
      return { ...f, path: posixRelative(outDir, wt) };
    }
    const joined = path.resolve(wt, trimmed);
    return { ...f, path: posixRelative(outDir, joined) };
  });
  return { ...workspace, folders: nextFolders };
}

export function writeWorkspace(
  sourcePath: string,
  outputPath: string,
  worktreeAbs: string,
): void {
  const raw = fs.readFileSync(sourcePath, "utf-8");
  const parsed = JSON.parse(raw) as VsCodeWorkspace;
  const rewritten = rewriteWorkspaceFolders(parsed, outputPath, worktreeAbs);
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(rewritten, null, 2)}\n`,
    "utf-8",
  );
}
