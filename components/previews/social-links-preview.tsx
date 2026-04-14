"use client"

import { SocialLinks } from "@/components/ui/social-links"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SocialLinksPreview() {
  const { values, entries } = useControls({
    showLabels: { type: "boolean", default: false },
    direction: {
      type: "select",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <SocialLinks
        showLabels={values.showLabels}
        direction={values.direction as "horizontal"}
        links={[
          { platform: "github", url: "https://github.com" },
          { platform: "x", url: "https://x.com" },
          { platform: "linkedin", url: "https://linkedin.com" },
          { platform: "discord", url: "https://discord.com" },
        ]}
      />
    </PreviewLayout>
  )
}
