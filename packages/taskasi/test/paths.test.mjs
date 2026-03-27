import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { expandPlaceholders, posixRelative } from "../dist/paths.js";

describe("expandPlaceholders", () => {
  it("replaces known tokens", () => {
    assert.equal(
      expandPlaceholders("{basename}-{id}.workspace", {
        basename: "app",
        id: "42",
      }),
      "app-42.workspace",
    );
  });
  it("replaces multiple occurrences", () => {
    assert.equal(
      expandPlaceholders("{a}+{a}", { a: "x" }),
      "x+x",
    );
  });
});

describe("posixRelative", () => {
  it("uses forward slashes", () => {
    const from = path.join("/tmp", "repo");
    const to = path.join("/tmp", "repo", "apps", "api");
    assert.equal(posixRelative(from, to), "apps/api");
  });
});
