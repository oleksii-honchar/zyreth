# Publishing `@zyreth/agasi` to npm

This package is **scoped** (`@zyreth/agasi`). Publishing requires an npm org or user named `zyreth` with permission to publish that scope, or a one-time rename to an unscoped name (not covered here).

## Preconditions

1. **Node.js ≥ 20** on the machine you publish from.
2. **npm account** with access to the **`@zyreth`** scope (`npm org ls` / org admin).
3. **Git state clean** for the commit you tag (optional but recommended).

## Dry run (local tarball)

From `packages/agasi`:

```bash
npm install
npm run build
npm run pack:dry
```

Inspect the reported file list: it should include **`dist/`**, **`README.md`**, **`LICENSE`**, and **`PUBLISHING.md`** (no `src/` or `docs/`).

To produce a real tarball without publishing:

```bash
npm pack
# inspect zyreth-agasi-0.1.0.tgz
```

## Version bump

Use [semantic versioning](https://semver.org/):

- **patch** — bug fixes only (e.g. `0.1.0` → `0.1.1`)
- **minor** — backward-compatible features (e.g. `0.1.0` → `0.2.0`)
- **major** — breaking CLI or config changes

```bash
npm version patch   # or minor | major
```

This updates `package.json` and creates a git tag **if** the repo root is a git worktree and the command is run from the package directory in a way npm expects. If the monorepo root is elsewhere, bump `version` in `package.json` manually and tag at the monorepo root:

```bash
git tag -a @zyreth/agasi-v0.1.1 -m "Release @zyreth/agasi 0.1.1"
```

## Publish

```bash
cd packages/agasi
npm publish --access public
```

`publishConfig.access` is already set to **`public`** in `package.json` for scoped packages.

### First-time login

```bash
npm login
npm whoami
```

Use **automation tokens** (npm website → Access Tokens) for CI; store as `NPM_TOKEN` and use:

```bash
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
```

(Prefer CI secret injection over committing `.npmrc`.)

## After publish — install for users

**Global:**

```bash
npm install -g @zyreth/agasi
agasi --help
```

**One-off (no global install):**

```bash
npx @zyreth/agasi@latest --help
```

Document the chosen command in your team wiki or repo README.

## Static documentation site (optional)

Markdown under **`docs/`** is built with **VitePress** (searchable static HTML, no backend):

```bash
npm install
npm run docs:build
```

Upload **`docs/.vitepress/dist/`** to GitHub Pages or any static host. This output is **not** part of the npm tarball by default.

## CI checklist (optional)

- [ ] Workflow runs `npm ci`, `npm run build`, `npm test`, and optionally `npm run docs:build`.
- [ ] On tag matching `@zyreth/agasi-v*`, run `npm publish` with `NPM_TOKEN`.
- [ ] Changelog or GitHub Release notes point to `README.md` / docs and session **architect/spec.md** for design context.

## Unpublish / deprecation

npm discourages unpublishing public versions. Prefer **`npm deprecate`**:

```bash
npm deprecate @zyreth/agasi@0.1.0 "Use >=0.1.1; see release notes"
```
