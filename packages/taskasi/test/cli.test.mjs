import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliJs = path.join(__dirname, "..", "dist", "cli.js");

describe("cli smoke", () => {
  it("prints help with exit 0", () => {
    const r = spawnSync(process.execPath, [cliJs, "--help"], {
      encoding: "utf-8",
    });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /taskasi/i);
  });

  it("switch --help lists flags", () => {
    const r = spawnSync(process.execPath, [cliJs, "switch", "--help"], {
      encoding: "utf-8",
    });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /--no-env/);
    assert.match(r.stdout, /--no-workspace/);
  });

  it("cli.js has shebang for bin", () => {
    const head = fs.readFileSync(cliJs, "utf-8").split("\n")[0];
    assert.match(head, /^#!/);
  });
});
