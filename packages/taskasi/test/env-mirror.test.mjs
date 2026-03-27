import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isStandardDotenvBasename,
  patternLooksEnvRelated,
} from "../dist/env-mirror.js";

describe("isStandardDotenvBasename", () => {
  it("matches .env", () => {
    assert.equal(isStandardDotenvBasename(".env"), true);
  });
  it("matches .env.*", () => {
    assert.equal(isStandardDotenvBasename(".env.local"), true);
    assert.equal(isStandardDotenvBasename(".env.tpl"), true);
    assert.equal(isStandardDotenvBasename(".env.dev"), true);
  });
  it("rejects foo.env and .envrc", () => {
    assert.equal(isStandardDotenvBasename("foo.env"), false);
    assert.equal(isStandardDotenvBasename(".envrc"), false);
  });
});

describe("patternLooksEnvRelated", () => {
  it("matches common gitignore env patterns", () => {
    assert.equal(patternLooksEnvRelated(".env"), true);
    assert.equal(patternLooksEnvRelated(".env.*"), true);
    assert.equal(patternLooksEnvRelated("*.env"), true);
    assert.equal(patternLooksEnvRelated("**/.env"), true);
    assert.equal(patternLooksEnvRelated("apps/foo/.env"), true);
  });
  it("rejects unrelated patterns", () => {
    assert.equal(patternLooksEnvRelated("*.log"), false);
    assert.equal(patternLooksEnvRelated("dist/"), false);
  });
});
