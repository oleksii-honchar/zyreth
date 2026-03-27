# agasi tests

- **Runner:** Node.js built-in **`node:test`** (requires `npm run build` first — tests import **`../dist/*.js`**).
- **Concurrency:** `package.json` uses **`--test-concurrency=1`** for stable temp-dir usage.
- **Integration:** `cli.integration.test.mjs` spawns **`node dist/cli.js`** with a temp `--config` file.

Add new suites as `test/*.test.mjs` and append the path to the **`test`** script in **`package.json`**.
