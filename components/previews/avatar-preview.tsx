"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function AvatarPreview() {
  const { values, entries } = useControls({
    fallback: { type: "text", default: "SC" },
    src: {
      type: "select",
      options: ["none", "https://api.dicebear.com/9.x/notionists/svg?seed=Scintillar"],
      default: "https://api.dicebear.com/9.x/notionists/svg?seed=Scintillar",
    },
    size: {
      type: "select",
      options: ["sm", "default", "lg"],
      default: "default",
    },
  })

  const showImage = values.src !== "none"

  return (
    <PreviewLayout controls={entries}>
      <Avatar key={values.src} size={values.size as "default"}>
        {showImage && <AvatarImage src={values.src} alt="User" />}
        <AvatarFallback>{values.fallback}</AvatarFallback>
      </Avatar>
    </PreviewLayout>
  )
}
