"use client"

import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { FormSection } from "../form-section/form-section"

export interface EmailUpdateFormProps {
  /** The user's current email address (displayed as readonly). */
  currentEmail?: string
  /** Called when the user submits the new email. */
  onSubmit?: (data: { newEmail: string; password: string }) => void
  /** Called when the user cancels. */
  onCancel?: () => void
  /** Additional CSS classes. */
  className?: string
}

/**
 * An email update form section. Shows the current email as readonly,
 * with fields for a new email and password confirmation.
 * Uses FormSection for consistent layout.
 */
export function EmailUpdateForm({
  currentEmail = "",
  onSubmit,
  onCancel,
  className,
}: EmailUpdateFormProps) {
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({ newEmail, password })
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FormSection
        title="Email address"
        description="Update the email address associated with your account."
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Update email</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Current email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="new@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-password">Password</Label>
            <Input
              id="email-password"
              type="password"
              placeholder="Confirm your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
      </FormSection>
    </form>
  )
}
