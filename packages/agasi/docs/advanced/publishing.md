# Publishing to npm

This page summarizes maintainer steps. The canonical checklist lives in the repository file **`PUBLISHING.md`** at the package root.

## Quick commands

```bash
cd packages/agasi
npm run pack:dry    # inspect tarball contents
npm version patch   # or minor / major (if using git tags from package dir)
npm publish --access public
```

Scoped package **`@zyreth/agasi`** requires **`publishConfig.access: public`** (already set in `package.json`).

## What gets published

The npm package includes **`dist/`**, **`README.md`**, **`LICENSE`**, and **`PUBLISHING.md`**. **Markdown docs** under **`docs/`** are **not** in the tarball by default — they are for **Git + VitePress** builds and GitHub Pages.

## Deploying the static doc site

```bash
npm run docs:build
```

Publish **`docs/.vitepress/dist/`** to static hosting. Search works **offline** in the built site (local index).

## Links

- [Installation](/guide/installation)
- [PUBLISHING.md](https://github.com/oleksii-honchar/zyreth/blob/main/packages/agasi/PUBLISHING.md) (raw file in repo)
