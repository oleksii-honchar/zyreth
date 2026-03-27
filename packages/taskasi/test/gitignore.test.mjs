import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ensureTaskasiGitignoreRules } from "../dist/gitignore.js";
import { mkTestTmp, rmTestTmp } from "./helpers/tmp.mjs";

describe("ensureTaskasiGitignoreRules", () => {
  it("creates .gitignore with taskasi block", () => {
    const tmp = mkTestTmp("gi-a-");
    try {
      const touched = ensureTaskasiGitignoreRules(tmp, "subscriptions");
      assert.equal(touched, true);
      const gi = fs.readFileSync(path.join(tmp, ".gitignore"), "utf-8");
      assert.match(gi, /# >>> taskasi/);
      assert.match(gi, /subscriptions-\*\.workspace/);
      assert.match(gi, /# <<< taskasi/);
    } finally {
      rmTestTmp(tmp);
    }
  });

  it("is idempotent when basename unchanged", () => {
    const tmp = mkTestTmp("gi-b-");
    try {
      assert.equal(ensureTaskasiGitignoreRules(tmp, "subscriptions"), true);
      assert.equal(ensureTaskasiGitignoreRules(tmp, "subscriptions"), false);
    } finally {
      rmTestTmp(tmp);
    }
  });
});
