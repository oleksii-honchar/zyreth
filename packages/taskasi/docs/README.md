# taskasi documentation sources

This directory contains **Markdown** for the **VitePress** site.

- **Config:** `docs/.vitepress/config.mts` (nav, sidebar, **local search**).
- **Build:** from `packages/taskasi`, run `npm run docs:build` → output **`docs/.vitepress/dist/`** (static HTML + search index).
- **Dev:** `npm run docs:dev`.

Do not commit `docs/.vitepress/cache` or `docs/.vitepress/dist` (gitignored at repo level).
