# Testing

The package uses **Node.js’s built-in test runner** (`node:test`). Tests import compiled code from **`dist/`** after `npm run build`.

## Commands

```bash
npm test
```

Runs **`test/*.test.mjs`** only (top-level). This set is **restricted-sandbox friendly** (e.g. Cursor agent default): temp dirs live under **`test/.tmp/`** in the repo, and there is **no** real `git init` / hooks in the default suite.

### Git integration (open shell / full permissions)

```bash
npm run test:integration
# or: npm run test:all
```

- **`test:integration`** — only **`test/integration/git.test.mjs`** (`getGitRoot`, `localBranchExists`, `addWorktree` against a real repo).
- **`test:all`** — default unit tests **plus** integration (same `node --test` invocation, one build).

**Why separate:** `git init` often writes under `.git/hooks/`. In a **restricted sandbox**, that can fail with `Operation not permitted`. Run integration tests in an **open shell** or with full permissions for the test process.

## Layout

| Path | Role |
|------|------|
| `test/helpers/tmp.mjs` | Creates temp dirs under `test/.tmp/` (gitignored) |
| `test/*.test.mjs` | Unit / file-based tests (default `npm test`) |
| `test/integration/git.test.mjs` | Real `git` binary (opt-in) |

## `node --test` flags

```bash
node --test --test-concurrency=1 test/*.test.mjs
```

`--test-concurrency=1` runs **one test file at a time** so environment variables such as **`TASKASI_CONFIG_PATH`** do not leak between files.

## Config tests

Point the global config at a file without touching your home directory:

```bash
TASKASI_CONFIG_PATH=/path/to/config.yaml node --test test/config.test.mjs
```

(`loadConfig` / `initConfigFile` use `getTaskasiConfigPath()`; see `paths.ts`.)

## Adding tests

1. Add **`something.test.mjs`** under **`test/`** for sandbox-safe tests.
2. Add integration tests under **`test/integration/`** and wire them into **`test:integration`** / **`test:all`** if they need full OS or `git`.
