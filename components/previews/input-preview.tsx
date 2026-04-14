"use client"

import { Input } from "@/components/ui/input"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function InputPreview() {
  const { values, entries } = useControls({
    placeholder: { type: "text", default: "Enter text..." },
    type: {
      type: "select",
      options: ["text", "email", "password", "number", "search"],
      default: "text",
    },
    disabled: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <Input
        type={values.type}
        placeholder={values.placeholder}
        disabled={values.disabled}
        className="max-w-sm"
      />
    </PreviewLayout>
  )
}
