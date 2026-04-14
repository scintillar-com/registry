"use client"

import { Separator } from "@/components/ui/separator"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SeparatorPreview() {
  const { values, entries } = useControls({
    orientation: {
      type: "select",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      {values.orientation === "horizontal" ? (
        <div className="space-y-1 w-64">
          <p className="text-sm font-medium">Above</p>
          <Separator orientation="horizontal" />
          <p className="text-sm font-medium">Below</p>
        </div>
      ) : (
        <div className="flex h-12 items-center gap-4 text-sm">
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Right</span>
        </div>
      )}
    </PreviewLayout>
  )
}
