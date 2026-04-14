"use client"

import { FormSection } from "@/registry/new-york/blocks/form-section/form-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function FormSectionPreview() {
  const { values, entries } = useControls({
    destructive: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <FormSection
        title="Profile"
        description="Update your profile information"
        destructive={values.destructive}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
        </div>
      </FormSection>
    </PreviewLayout>
  )
}
