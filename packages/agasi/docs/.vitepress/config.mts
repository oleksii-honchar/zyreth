import { defineConfig } from "vitepress";

export default defineConfig({
  title: "agasi",
  description:
    "Symlink flat agent skills (SKILL.md) into Cursor, .agents, Codex, and custom paths — one global config.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/cli" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Integrations (Cursor, Codex, agents)", link: "/guide/integrations" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI commands", link: "/reference/cli" },
          { text: "Config file", link: "/reference/config" },
        ],
      },
      {
        text: "Advanced",
        items: [{ text: "Publishing to npm", link: "/advanced/publishing" }],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/oleksii-honchar/zyreth/tree/main/packages/agasi",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © present Zyreth",
    },
    editLink: {
      pattern:
        "https://github.com/oleksii-honchar/zyreth/edit/main/packages/agasi/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
