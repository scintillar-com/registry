"use client"

import { AuthLogin } from "@/registry/new-york/blocks/auth-login/auth-login"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function AuthLoginPreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["centered", "split"],
      default: "centered",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <AuthLogin
        variant={values.variant as "centered" | "split"}
        title="Welcome back"
        description="Sign in to your account"
        onSubmit={() => {}}
        onForgotPassword={() => {}}
        onRegister={() => {}}
      />
    </PreviewLayout>
  )
}
