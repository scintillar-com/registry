"use client"

import { AuthRegister } from "@/registry/new-york/blocks/auth-register/auth-register"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function AuthRegisterPreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["centered", "split"],
      default: "centered",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <AuthRegister
        variant={values.variant as "centered" | "split"}
        title="Create an account"
        onSubmit={() => {}}
        onLogin={() => {}}
      />
    </PreviewLayout>
  )
}
