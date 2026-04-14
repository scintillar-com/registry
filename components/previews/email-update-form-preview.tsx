"use client"

import { EmailUpdateForm } from "@/registry/new-york/blocks/email-update-form/email-update-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function EmailUpdateFormPreview() {
  return (
    <PreviewLayout controls={[]}>
      <EmailUpdateForm
        currentEmail="jane@example.com"
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </PreviewLayout>
  )
}
