"use client"

import { Badge } from "@/components/ui/badge"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function BadgePreview() {
  const { values, entries } = useControls({
    label: { type: "text", default: "Badge" },
    variant: {
      type: "select",
      options: ["default", "secondary", "destructive", "outline"],
      default: "default",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <Badge variant={values.variant as "default"}>{values.label}</Badge>
    </PreviewLayout>
  )
}
