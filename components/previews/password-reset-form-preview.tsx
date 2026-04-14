"use client"

import { PasswordResetForm } from "@/registry/new-york/blocks/password-reset-form/password-reset-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function PasswordResetFormPreview() {
  return (
    <PreviewLayout controls={[]}>
      <PasswordResetForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </PreviewLayout>
  )
}
