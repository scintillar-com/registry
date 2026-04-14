"use client"

import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Label } from "../../../../components/ui/label"
import { PasswordInput } from "../../../../components/ui/password-input"
import { FormSection } from "../form-section/form-section"

export interface PasswordResetFormProps {
  /** Called when the user submits the password change. */
  onSubmit?: (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => void
  /** Called when the user cancels. */
  onCancel?: () => void
  /** Additional CSS classes. */
  className?: string
}

/**
 * A password change form section with current password, new password
 * (with strength indicator), and confirm new password fields.
 * Uses FormSection for consistent layout.
 */
export function PasswordResetForm({
  onSubmit,
  onCancel,
  className,
}: PasswordResetFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({ currentPassword, newPassword, confirmPassword })
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FormSection
        title="Password"
        description="Change the password used to sign in to your account."
        footer={
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Update password</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showStrength
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <PasswordInput
              id="confirm-new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
      </FormSection>
    </form>
  )
}
