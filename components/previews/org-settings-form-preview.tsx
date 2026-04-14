"use client"

import { OrgSettingsForm } from "@/registry/new-york/blocks/org-settings-form/org-settings-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function OrgSettingsFormPreview() {
  return (
    <PreviewLayout controls={[]}>
      <OrgSettingsForm
        name="Scintillar"
        slug="scintillar"
        description="Building the future of collaborative apps"
        website="https://scintillar.com"
        initials="SC"
        onSave={() => {}}
        onCancel={() => {}}
        onLogoChange={() => {}}
      />
    </PreviewLayout>
  )
}
