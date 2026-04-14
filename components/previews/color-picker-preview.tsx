"use client"

import { useState } from "react"
import { ColorPicker } from "@/components/ui/color-picker"
import { ColorSwatch } from "@/components/ui/color-swatch"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function ColorPickerPreview() {
  const [color, setColor] = useState("#6366f1")
  const [opacity, setOpacity] = useState(100)
  const [open, setOpen] = useState(false)

  const { values, entries } = useControls({
    enableGradient: { type: "boolean", default: false },
    format: {
      type: "select",
      options: ["hex", "rgb", "hsl", "cmyk"],
      default: "hex",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="flex items-start gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Click to edit:</p>
          <ColorSwatch
            hex={color}
            opacity={opacity}
            size="size-10"
            className="cursor-pointer rounded-md border"
            onClick={() => setOpen(!open)}
          />
        </div>
        {open && (
          <ColorPicker
            value={color}
            opacity={opacity}
            format={values.format as "hex"}
            enableGradient={values.enableGradient}
            onSave={(hex, op) => {
              setColor(hex)
              setOpacity(op)
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </div>
    </PreviewLayout>
  )
}
