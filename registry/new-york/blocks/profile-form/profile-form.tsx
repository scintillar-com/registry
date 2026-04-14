"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { FormSection } from "../form-section/form-section"

export interface ProfileFormLabels {
  title: string
  description: string
  cancel: string
  save: string
  uploadHint: string
  avatarAlt: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  bioLabel: string
  bioPlaceholder: string
}

const defaultLabels: ProfileFormLabels = {
  title: "Profile",
  description: "Manage your public profile information.",
  cancel: "Cancel",
  save: "Save",
  uploadHint: "Click to upload",
  avatarAlt: "Avatar",
  nameLabel: "Name",
  namePlaceholder: "Your name",
  emailLabel: "Email",
  bioLabel: "Bio",
  bioPlaceholder: "Tell us about yourself",
}

export interface ProfileFormProps {
  /** User display name. */
  name?: string
  /** User email address (displayed as readonly). */
  email?: string
  /** User bio / about text. */
  bio?: string
  /** Called when the user saves the form. */
  onSave?: (data: { name: string; bio: string }) => void
  /** Called when the user cancels editing. */
  onCancel?: () => void
  /** Whether to show the avatar upload area. */
  showAvatar?: boolean
  /** Current avatar image URL. */
  avatarUrl?: string
  /** Called when the user selects a new avatar file. */
  onAvatarChange?: (file: File) => void
  /** Compact mode: smaller avatar, reduced spacing, fewer textarea rows. */
  compact?: boolean
  /** Additional CSS classes. */
  className?: string
  /** Override internal labels for localization. */
  labels?: Partial<ProfileFormLabels>
}

/**
 * A profile form section for editing user display name, bio, and optional avatar.
 * Email is shown as readonly. Uses FormSection for consistent layout.
 */
export function ProfileForm({
  name: initialName = "",
  email = "",
  bio: initialBio = "",
  onSave,
  onCancel,
  showAvatar = false,
  avatarUrl,
  onAvatarChange,
  compact = false,
  className,
  labels,
}: ProfileFormProps) {
  const l = { ...defaultLabels, ...labels }
  const [name, setName] = useState(initialName)
  const [bio, setBio] = useState(initialBio)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave?.({ name, bio })
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onAvatarChange?.(file)
  }

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <FormSection
        title={l.title}
        className={cn("h-full", className)}
        description={l.description}
        compact={compact}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={onCancel}
            >
              {l.cancel}
            </Button>
            <Button type="submit" size={compact ? "sm" : "default"}>
              {l.save}
            </Button>
          </>
        }
      >
        <div className={cn("flex flex-col h-full", compact ? "gap-3" : "gap-6")}>
          {showAvatar && (
            <div className={cn("flex items-center shrink-0", compact ? "gap-2" : "gap-4")}>
              <div className="relative group">
                <div
                  className={cn(
                    "flex items-center justify-center overflow-hidden rounded-full bg-muted",
                    compact ? "size-10" : "size-20",
                    !avatarUrl && "border-2 border-dashed border-muted-foreground/25"
                  )}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar from user-provided URL, not a static asset
                    <img
                      src={avatarUrl}
                      alt={l.avatarAlt}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Camera className={cn(compact ? "size-4" : "size-6", "text-muted-foreground")} />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Camera className={cn(compact ? "size-3" : "size-5")} />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarSelect}
                />
              </div>
              <div className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-sm")}>
                {l.uploadHint}
              </div>
            </div>
          )}

          <div className={cn("shrink-0", compact ? "space-y-1" : "space-y-2")}>
            <Label htmlFor="profile-name" className={cn(compact && "text-xs")}>{l.nameLabel}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={l.namePlaceholder}
              className={cn(compact && "h-7 text-xs")}
            />
          </div>

          <div className={cn("shrink-0", compact ? "space-y-1" : "space-y-2")}>
            <Label htmlFor="profile-email" className={cn(compact && "text-xs")}>{l.emailLabel}</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className={cn("bg-muted", compact && "h-7 text-xs")}
            />
          </div>

          <div className={cn("flex flex-col flex-1 min-h-0", compact ? "space-y-1" : "space-y-2")}>
            <Label htmlFor="profile-bio" className={cn("shrink-0", compact && "text-xs")}>{l.bioLabel}</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={l.bioPlaceholder}
              className={cn("flex-1 min-h-0 resize-none", compact && "text-xs")}
            />
          </div>
        </div>
      </FormSection>
    </form>
  )
}
