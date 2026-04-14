import { defineConfig } from "@sntlr/registry-shell"

export default defineConfig({
  branding: {
    siteName: "Scintillar UI",
    shortName: "UI",
    siteUrl: "https://ui.sntlr.app",
    description:
      "Web components built for live collaboration, with React & Next.",
    twitterHandle: "scintillar",
    github: {
      owner: "scintillar-com",
      repo: "ui-registry",
      label: "Github",
      showStars: true,
    },
    logoAlt: "Scintillar",
    faviconDark: "/favicon_dark.svg",
    faviconLight: "/favicon_light.svg",
    faviconIco: "/favicon.ico",
  },

  // Docs ship under content/docs/{locale}/ subfolders.
  multilocale: true,
  defaultLocale: "en",
  // `locales` is auto-scanned from content/docs/; set explicitly to control order.

  // Defaults match Scintillar's existing layout:
  //   components: "components/ui"
  //   blocks: "registry/new-york/blocks"
  //   previews: "components/previews/index.ts"
  //   docs: "content/docs"
  //   registryJson: "public/r"
  paths: {
    skipBlocks: ["hello-world", "example-form"],
  },

  // The marketing landing lives in registry-shell-site; `pnpm shell` serves
  // the shell's built-in component/block index at `/`.

  // installCommandTemplate defaults to
  //   "npx shadcn@latest add {siteUrl}/r/{name}.json"
  // — set to something else here to override.
})
