"use client"

import { PasswordInput } from "@/components/ui/password-input"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function PasswordInputPreview() {
  const { values, entries } = useControls({
    showStrength: { type: "boolean", default: true },
    severity: {
      type: "select",
      options: ["low", "medium", "high"],
      default: "medium",
    },
    placeholder: { type: "text", default: "Enter password" },
  })

  return (
    <PreviewLayout controls={entries}>
      <PasswordInput
        showStrength={values.showStrength}
        severity={values.severity as "medium"}
        placeholder={values.placeholder}
        className="max-w-sm"
      />
    </PreviewLayout>
  )
}
