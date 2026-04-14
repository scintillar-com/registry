"use client"

import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, Underline } from "lucide-react"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function TogglePreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["default", "outline"],
      default: "default",
    },
    size: {
      type: "select",
      options: ["default", "sm", "lg"],
      default: "default",
    },
    disabled: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="flex items-center gap-1">
        <Toggle
          variant={values.variant as "default"}
          size={values.size as "default"}
          disabled={values.disabled}
          aria-label="Toggle bold"
        >
          <Bold className="size-4" />
        </Toggle>
        <Toggle
          variant={values.variant as "default"}
          size={values.size as "default"}
          disabled={values.disabled}
          aria-label="Toggle italic"
        >
          <Italic className="size-4" />
        </Toggle>
        <Toggle
          variant={values.variant as "default"}
          size={values.size as "default"}
          disabled={values.disabled}
          aria-label="Toggle underline"
        >
          <Underline className="size-4" />
        </Toggle>
      </div>
    </PreviewLayout>
  )
}
