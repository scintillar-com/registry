"use client"

import { ColorSwatch, ColorValue } from "@/components/ui/color-swatch"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function ColorSwatchPreview() {
  const { values, entries } = useControls({
    color: { type: "text", default: "#6366f1" },
    opacity: { type: "number", default: 100, min: 0, max: 100 },
    size: {
      type: "select",
      options: ["size-6", "size-8", "size-10", "size-12"],
      default: "size-8",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="flex items-center gap-6">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Swatch</p>
          <ColorSwatch hex={values.color} opacity={values.opacity} size={values.size} />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Value</p>
          <ColorValue hex={values.color} opacity={values.opacity} />
        </div>
      </div>
    </PreviewLayout>
  )
}
