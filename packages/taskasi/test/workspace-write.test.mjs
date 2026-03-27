import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { writeWorkspace } from "../dist/workspace.js";
import { mkTestTmp, rmTestTmp } from "./helpers/tmp.mjs";

describe("writeWorkspace", () => {
  it("writes rewritten JSON next to template shape", () => {
    const tmp = mkTestTmp("wsw-");
    const src = path.join(tmp, "tpl.workspace");
    const out = path.join(tmp, "out-1.workspace");
    const wt = path.join(tmp, ".worktrees", "b1");
    fs.mkdirSync(wt, { recursive: true });
    fs.writeFileSync(
      src,
      JSON.stringify({
        folders: [{ name: "r", path: "." }, { name: "x", path: "../outside" }],
      }),
      "utf-8",
    );
    try {
      writeWorkspace(src, out, wt);
      const parsed = JSON.parse(fs.readFileSync(out, "utf-8"));
      assert.equal(parsed.folders[0].path, path.relative(path.dirname(out), wt).split(path.sep).join("/"));
      assert.equal(parsed.folders[1].path, "../outside");
    } finally {
      rmTestTmp(tmp);
    }
  });
});
