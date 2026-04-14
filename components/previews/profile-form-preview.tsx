"use client"

import { ProfileForm } from "@/registry/new-york/blocks/profile-form/profile-form"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function ProfileFormPreview() {
  const { values, entries } = useControls({
    showAvatar: { type: "boolean", default: true },
  })

  return (
    <PreviewLayout controls={entries}>
      <ProfileForm
        name="Jane Doe"
        email="jane@example.com"
        bio="Product designer"
        showAvatar={values.showAvatar}
        onSave={() => {}}
        onCancel={() => {}}
      />
    </PreviewLayout>
  )
}
