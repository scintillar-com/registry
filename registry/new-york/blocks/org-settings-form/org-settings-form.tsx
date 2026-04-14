"use client"

import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { FormSection } from "../form-section/form-section"
import { Upload } from "lucide-react"

export interface OrgSettingsFormProps {
  /** Organization display name. */
  name: string
  /** Organization slug/identifier. */
  slug: string
  /** Organization description/bio. */
  description?: string
  /** Organization logo URL. */
  logoUrl?: string
  /** Organization initials for avatar fallback. */
  initials?: string
  /** Website URL. */
  website?: string
  /** Called when the form is saved. */
  onSave?: (data: { name: string; slug: string; description: string; website: string }) => void
  /** Called when cancelled. */
  onCancel?: () => void
  /** Called when the logo is changed. */
  onLogoChange?: () => void
  /** Additional CSS classes. */
  className?: string
}

/** General organization settings form section with name, slug, description, logo, and website. */
export function OrgSettingsForm({
  name,
  slug,
  description = "",
  logoUrl,
  initials,
  website = "",
  onSave,
  onCancel,
  onLogoChange,
  className,
}: OrgSettingsFormProps) {
  return (
    <FormSection
      title="General"
      description="Manage your organization's profile and settings."
      className={className}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave?.({ name, slug, description, website })}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
            <AvatarFallback className="text-lg">
              {initials ?? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Button variant="outline" size="sm" onClick={onLogoChange}>
              <Upload className="size-4 mr-1.5" />
              Change logo
            </Button>
            <p className="text-xs text-muted-foreground">Recommended: 256x256px, PNG or SVG</p>
          </div>
        </div>

        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="org-name">Organization name</Label>
          <Input id="org-name" defaultValue={name} placeholder="Acme Inc." />
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <Label htmlFor="org-slug">Slug</Label>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-1">scintillar.com/</span>
            <Input id="org-slug" defaultValue={slug} placeholder="acme" className="flex-1" />
          </div>
          <p className="text-xs text-muted-foreground">Used in URLs and API references.</p>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="org-desc">Description</Label>
          <Textarea id="org-desc" defaultValue={description} placeholder="A short description of your organization..." rows={3} />
        </div>

        {/* Website */}
        <div className="grid gap-2">
          <Label htmlFor="org-website">Website</Label>
          <Input id="org-website" type="url" defaultValue={website} placeholder="https://example.com" />
        </div>
      </div>
    </FormSection>
  )
}
