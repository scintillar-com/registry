"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function CheckboxPreview() {
  const { values, entries } = useControls({
    label: { type: "text", default: "Accept terms and conditions" },
    disabled: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="flex items-center gap-2">
        <Checkbox id="preview" disabled={values.disabled} />
        <Label htmlFor="preview">{values.label}</Label>
      </div>
    </PreviewLayout>
  )
}
