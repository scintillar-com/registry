"use client"

import { AccountDeletionForm } from "@/registry/new-york/blocks/account-deletion-form/account-deletion-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function AccountDeletionFormPreview() {
  return (
    <PreviewLayout controls={[]}>
      <AccountDeletionForm
        accountIdentifier="my-project"
        onDelete={() => {}}
      />
    </PreviewLayout>
  )
}
