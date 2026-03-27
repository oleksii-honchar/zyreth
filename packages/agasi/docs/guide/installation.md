# Installation

## Requirements

- **Node.js ≥ 20**
- **POSIX** (macOS, Linux) recommended. On Windows, symlinks/junctions may require Developer Mode or elevated rights; behavior is best-effort.

## Global install (recommended for daily use)

```bash
npm install -g @zyreth/agasi
agasi --help
```

## One-off via npx

```bash
npx @zyreth/agasi@latest init
npx @zyreth/agasi@latest --help
```

Prefix every command with `npx @zyreth/agasi@latest` if you do not want a global install.

## From this monorepo (development)

```bash
cd packages/agasi
npm install
npm run build
npm link
agasi --help
```

## Configuration path

- Default: **`~/.agasi/config.yaml`**
- Override: **`--config /path/to/file`** or environment variable **`AGASI_CONFIG_PATH`**

## Running tests (contributors)

From `packages/agasi`:

```bash
npm install
npm test
```

This runs unit and integration tests (`node:test` against `dist/`). See the repository **`test/README.md`** for layout.

## Static documentation site (searchable)

The docs you are reading are **Markdown** sources processed by **VitePress**. To build **static HTML** with **client-side search** (no server):

```bash
cd packages/agasi
npm install
npm run docs:build
```

Output: **`docs/.vitepress/dist/`** — deploy that folder to any static host (GitHub Pages, Netlify, S3, etc.).

Local preview after build:

```bash
npm run docs:preview
```

Edit docs with hot reload:

```bash
npm run docs:dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

## Publishing the npm package

Maintainers: see [Publishing to npm](/advanced/publishing) and the repo file **`PUBLISHING.md`**.
