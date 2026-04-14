"use client"

import { MfaForm } from "@/registry/new-york/blocks/mfa-form/mfa-form"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function MfaFormPreview() {
  const { values, entries } = useControls({
    enabled: { type: "boolean", default: false },
    method: {
      type: "select",
      options: ["app", "sms", "none"],
      default: "none",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <MfaForm
        enabled={values.enabled}
        method={values.method === "none" ? null : (values.method as "app" | "sms")}
        onToggle={() => {}}
        onSetup={() => {}}
      />
    </PreviewLayout>
  )
}
