# Installation

## From npm (recommended)

```bash
npm install -g @zyreth/taskasi
```

Verify:

```bash
which taskasi
taskasi --help
```

The package is scoped as **`@zyreth/taskasi`**; the executable name is **`taskasi`**.

## From a git clone (development)

In the package directory:

```bash
cd packages/taskasi
npm install
npm run build
npm link
```

This links the global `taskasi` command to your working copy. After code changes:

```bash
npm run build
```

## Documentation site (this book)

From `packages/taskasi`:

```bash
npm run docs:dev
```

Opens the VitePress dev server with **search** enabled (local index).

To produce **static HTML** for hosting (GitHub Pages, S3, any static host):

```bash
npm run docs:build
```

Output directory: `docs/.vitepress/dist`. Preview locally:

```bash
npm run docs:preview
```

### Deploying static docs

- Serve the contents of **`docs/.vitepress/dist`** as the site root.
- If the site is not at the domain root (e.g. GitHub Project Pages), set `base` in `docs/.vitepress/config.mts` (e.g. `base: '/zyreth/'`) so asset URLs resolve correctly.

## Requirements

| Requirement | Notes |
|-------------|--------|
| Node.js | 20+ (see `engines` in `package.json`) |
| Git | Used for `rev-parse`, `worktree`, `check-ignore` |
