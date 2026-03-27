---
layout: home

hero:
  name: agasi
  text: One skills tree, many agents
  tagline: Symlink a flat skills directory into Cursor, .agents, Codex, or custom paths — managed from ~/.agasi/config.yaml.

  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: CLI reference
      link: /reference/cli

features:
  - title: Global registry
    details: Named sources (local skills roots) and targets (repos + destination flavors) in a single YAML file. Override with --config or AGASI_CONFIG_PATH.
  - title: Symlink-first
    details: Edits in your canonical skills folder show up everywhere without copying. Use sync to repair links and optional prune to drop removed skills.
  - title: Multi-tool
    details: Map the same source to .cursor/skills, .agents/skills, $CODEX_HOME/skills, or arbitrary paths under a repo root.
---

## Search

Use the **search box** in the header. It is a **local full-text index** built when you run `vitepress build` — the deployed site is static HTML/JS/CSS with **no search backend**.

## Package

Published as **`@zyreth/agasi`**. Binary: **`agasi`**.

```bash
npm install -g @zyreth/agasi
```

See [Installation](/guide/installation) for `npm link`, `npx`, and building the docs site locally.
