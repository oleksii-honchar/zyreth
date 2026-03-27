# @zyreth/agasi

**agasi** is a small CLI that keeps **one canonical folder of agent skills** (flat layout: each skill is a directory with `SKILL.md`) and **symlinks** it into every tool-specific path you need—**Cursor** (`.cursor/skills`), **`.agents/skills`**, **Codex** (`~/.codex/skills` or `$CODEX_HOME/skills`), or a **custom** directory under a repo.

Use it as a **workflow “plugin”**: run it on your machine (or in onboarding scripts) to wire multiple repositories to the same skills tree without copying files. It is **not** a marketplace IDE extension.

---

## Full documentation (searchable static site)

Documentation is written in **Markdown** and built with **[VitePress](https://vitepress.dev/)** to **static HTML** with **local full-text search** (no backend—search index is generated at build time).

| What | Where |
|------|--------|
| **Browse in repo** | [`docs/`](./docs/) — start at [`docs/index.md`](./docs/index.md) |
| **Develop / preview** | `npm run docs:dev` → edit with hot reload |
| **Production build** | `npm run docs:build` → output **`docs/.vitepress/dist/`** |
| **Preview build** | `npm run docs:preview` |

Deploy **`docs/.vitepress/dist/`** to GitHub Pages, Netlify, or any static host. The header **search box** works against the built index.

### Doc contents (table of contents)

| Section | Topics |
|---------|--------|
| **Guide** | [Getting started](./docs/guide/getting-started.md), [Installation](./docs/guide/installation.md), [Integrations (Cursor, Codex, agents)](./docs/guide/integrations.md), [Configuration](./docs/guide/configuration.md), [Troubleshooting](./docs/guide/troubleshooting.md) |
| **Reference** | [CLI](./docs/reference/cli.md), [Config file](./docs/reference/config.md) |
| **Advanced** | [Publishing to npm](./docs/advanced/publishing.md) |

On npm, only this `README.md` ships inside the package; the full site lives in the **GitHub repo** under `packages/agasi/docs/`.

---

## Requirements

- **Node.js ≥ 20**
- **macOS / Linux** recommended (Windows: symlinks/junctions may need extra setup)

---

## Install (CLI)

```bash
npm install -g @zyreth/agasi
agasi --help
```

One-off:

```bash
npx @zyreth/agasi@latest --help
```

From this monorepo:

```bash
cd packages/agasi && npm install && npm run build && npm link
```

Config file default: **`~/.agasi/config.yaml`**. Override with **`--config`** or **`AGASI_CONFIG_PATH`**.

---

## Quick start

```bash
agasi init
agasi source add rules ~/Documents/agent-rules-n-skills/skills
agasi target add --id myrepo --source rules --repo ~/path/to/repo --dest cursor --dest agents
agasi install
agasi doctor
```

After skills change:

```bash
agasi sync
agasi sync --prune   # drop symlinks for removed skills
```

**Not in v0.1:** Git clone/fetch sources (`agasi fetch`) — planned as phase 2; today only **local `path` sources**.

---

## Configuration (overview)

See the **[Configuration guide](./docs/guide/configuration.md)** and **[Config reference](./docs/reference/config.md)** for the full schema.

```yaml
version: 1
sources:
  - name: rules
    path: ~/path/to/skills
targets:
  - id: app
    source: rules
    repoRoot: ~/path/to/repo
    destinations:
      - type: cursor
      - type: agents
```

---

## Safety (short)

- **Wrong symlink:** use **`sync`** or **`install --force`**.
- **Real directory** in the way: agasi **does not delete** it—remove or rename manually, then re-run **`install`**.
- **`sync --prune`:** only removes **symlinks** for skills gone from the source tree.

Details: [CLI reference — Safety](./docs/reference/cli.md#safety-behavior).

---

## Development

```bash
npm install
npm run build
npm test
npm run docs:dev     # VitePress dev server (edit docs/*.md)
npm run docs:build   # static site → docs/.vitepress/dist/
npm run docs:preview # preview the built site
```

### Tests

**`npm test`** runs **`node:test`** against compiled **`dist/`** (unit + integration):

| File | Coverage |
|------|-----------|
| `test/paths.test.mjs` | `expandHome` |
| `test/skills.test.mjs` | `listSkillNames`, `skillSourceDir` |
| `test/config.test.mjs` | `loadConfig`, `saveConfig`, validation errors, `assertSourcePathsExist`, helpers |
| `test/targets.test.mjs` | `resolveDestinations`, `resolveSkillsRoot`, `CODEX_HOME` |
| `test/link.test.mjs` | symlinks, wrong link + force, real directory, `pruneStaleSymlinks` |
| `test/cli.integration.test.mjs` | `init`, `source add`, `target add`, `install`, `config` |

Tests run with **`--test-concurrency=1`** to reduce filesystem cross-talk. Helpers: **`test/helpers.mjs`**.

---

## Related ecosystem

Pointers to **Vercel `npx skills`**, Codex, **agentskills.io**, Cursor—see your session **`architect/spec.md`** (“Related tools and industry context”) or the **Integrations** doc.

---

## License

MIT — see [LICENSE](./LICENSE).

## Maintainer publishing

See [PUBLISHING.md](./PUBLISHING.md) and [docs/advanced/publishing.md](./docs/advanced/publishing.md).
