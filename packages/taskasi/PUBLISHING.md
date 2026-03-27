# Publishing `@zyreth/taskasi`

Checklist before **`npm publish`**. Scoped packages under `@zyreth` must be published with **public** access (already set in `publishConfig`).

## Prerequisites

1. **Node.js** 20+ and **npm** 9+ (recommended).
2. **npm account** with permission to publish to the **`@zyreth`** scope (create the org/scope on npmjs.com or get an invite).
3. **Two-factor auth:** if OTP is required on publish, have your device ready (`npm publish` will prompt).
4. **`package.json` metadata** for this package is set to **`github.com/oleksii-honchar/zyreth`** (`repository`, `bugs`, `homepage`). Run **`npm pkg fix`** after edits if `npm publish` warns about `package.json` (e.g. `bin` path normalization).

## One-time: npm login

```bash
npm login
npm whoami
```

## Before every release

1. **Changelog / version** (manual today): decide semver bump (`patch` | `minor` | `major`).
2. **Bump version** (from `packages/taskasi/`):

   ```bash
   npm version patch
   ```

   This updates `package.json`, creates a git commit and tag **in the current repo** — only run if this package directory is the git root you tag from, or bump the version field by hand and commit from the monorepo root.

3. **Build, test, and inspect tarball:**

   ```bash
   npm install
   npm test
   npm run pack:dry
   ```

   `npm test` is **restricted-sandbox safe** (no real `git init`). For the full suite including **`test/integration/git.test.mjs`**, run **`npm run test:all`** in an environment where Git can create hooks (e.g. CI with full permissions, or local open shell).

   Confirm the archive lists `package.json`, `dist/`, `README.md`, and `LICENSE`.

4. **Optional metadata:** if the repo URL changes, update `repository` / `bugs` / `homepage` in `package.json` and run `npm pkg fix`.

## Publish

From **`packages/taskasi/`**:

```bash
npm publish --access public
```

`prepack` runs `npm run build` automatically; the published artifact contains compiled `dist/` only (plus files npm always includes: readme, license, `package.json`).

## After publish

```bash
npm view @zyreth/taskasi version
npm install -g @zyreth/taskasi
taskasi --help
```

## Documentation site (optional)

The **Markdown** docs under `docs/` are built with **VitePress** to static HTML:

```bash
npm run docs:build
```

Upload **`docs/.vitepress/dist/`** to your static host. For **GitHub Pages**, you can use a workflow that runs `docs:build` and publishes the `dist` artifact (set `base` in `docs/.vitepress/config.mts` if the site is not at the domain root).

## Dry run without publishing

```bash
npm pack
```

Produces `zyreth-taskasi-<version>.tgz` locally for inspection.

## Troubleshooting

| Issue | What to do |
|-------|----------------|
| `403 Forbidden` / scope | Ensure you are logged in as a user allowed to publish `@zyreth/*`; first publish needs `--access public`. |
| `You must specify a version` | Run `npm version` or edit `version` in `package.json`. |
| Binary missing after global install | Ensure `npm run build` succeeded; `bin` points to `./dist/cli.js` with a shebang. |
| OTP required | Use `npm publish --otp=<code>` or interactive prompt. |
