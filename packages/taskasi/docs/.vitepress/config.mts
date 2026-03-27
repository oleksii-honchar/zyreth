import { defineConfig } from "vitepress";

export default defineConfig({
  title: "taskasi",
  description:
    "Git worktrees, gitignore-aware env mirroring, and VS Code / Cursor workspace helper CLI.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/commands" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Environment files", link: "/guide/env-files" },
          { text: "Workspaces (VS Code / Cursor)", link: "/guide/workspaces" },
          { text: "Workflows", link: "/guide/workflows" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI commands", link: "/reference/commands" },
          { text: "Config keys", link: "/reference/config-keys" },
          { text: "Placeholders", link: "/reference/placeholders" },
          { text: "Testing", link: "/reference/testing" },
        ],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/oleksii-honchar/zyreth/tree/main/packages/taskasi",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © present Zyreth",
    },
    editLink: {
      pattern:
        "https://github.com/oleksii-honchar/zyreth/edit/main/packages/taskasi/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
