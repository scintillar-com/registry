"use client"

import { Textarea } from "@/components/ui/textarea"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function TextareaPreview() {
  const { values, entries } = useControls({
    placeholder: { type: "text", default: "Type your message here..." },
    disabled: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <Textarea
        placeholder={values.placeholder}
        disabled={values.disabled}
        className="max-w-sm"
      />
    </PreviewLayout>
  )
}
