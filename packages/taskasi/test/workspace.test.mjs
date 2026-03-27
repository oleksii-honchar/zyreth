import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteWorkspaceFolders } from "../dist/workspace.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("rewriteWorkspaceFolders", () => {
  it("rewrites root and in-repo paths; preserves ../", () => {
    const repoRoot = path.join(__dirname, "fixture-repo");
    const outFile = path.join(repoRoot, "app.workspace");
    const worktree = path.join(repoRoot, ".worktrees", "NWDEXP-1");

    const ws = {
      folders: [
        { name: "root", path: "." },
        { name: "api", path: "apps/api" },
        { name: "sibling", path: "../deploy" },
      ],
    };

    const next = rewriteWorkspaceFolders(ws, outFile, worktree);

    assert.equal(next.folders[0].path, ".worktrees/NWDEXP-1");
    assert.equal(next.folders[1].path, ".worktrees/NWDEXP-1/apps/api");
    assert.equal(next.folders[2].path, "../deploy");
  });
});
