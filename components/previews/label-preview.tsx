"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function LabelPreview() {
  const { values, entries } = useControls({
    text: { type: "text", default: "Name" },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="grid gap-2 max-w-sm">
        <Label htmlFor="name">{values.text}</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
    </PreviewLayout>
  )
}
