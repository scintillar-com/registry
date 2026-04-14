"use client"

import { SplitButton } from "@/components/ui/split-button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SplitButtonPreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["default", "secondary", "outline"],
      default: "default",
    },
    size: {
      type: "select",
      options: ["default", "sm", "lg"],
      default: "default",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <SplitButton
        variant={values.variant as "default"}
        size={values.size as "default"}
        onClick={() => {}}
        actions={[
          { label: "Save as draft", onClick: () => {} },
          { label: "Save and publish", onClick: () => {} },
          { label: "Delete", onClick: () => {}, destructive: true },
        ]}
      >
        Save
      </SplitButton>
    </PreviewLayout>
  )
}
