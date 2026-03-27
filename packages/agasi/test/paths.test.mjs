import assert from "node:assert";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { expandHome } from "../dist/paths.js";

test("expandHome resolves tilde to homedir", () => {
  const h = os.homedir();
  assert.strictEqual(expandHome("~/foo"), path.join(h, "foo"));
  assert.strictEqual(expandHome("~"), h);
});

test("expandHome resolves relative paths against cwd", () => {
  const r = expandHome("relative-sub");
  assert.ok(path.isAbsolute(r));
  assert.strictEqual(r, path.resolve("relative-sub"));
});
