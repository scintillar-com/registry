"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { FormSection } from "../form-section/form-section"
import { ConfirmDialog } from "../confirm-dialog/confirm-dialog"

export interface AccountDeletionFormProps {
  /** Called when the user confirms account deletion. */
  onDelete?: () => void
  /** The identifier the user must type to confirm deletion (e.g., their email or username). */
  accountIdentifier?: string
  /** Additional CSS classes. */
  className?: string
}

/**
 * An account deletion form section with a destructive confirmation dialog.
 * The user must type their account identifier to confirm the irreversible action.
 * Uses FormSection with destructive styling and ConfirmDialog with input-match.
 */
export function AccountDeletionForm({
  onDelete,
  accountIdentifier = "",
  className,
}: AccountDeletionFormProps) {
  return (
    <div className={className}>
      <FormSection
        title="Delete account"
        description="Permanently delete your account and all associated data."
        destructive
        footer={
          <ConfirmDialog
            title="Delete your account"
            description="This action is permanent and cannot be undone. All your data, including projects, settings, and history, will be permanently removed."
            confirmLabel="Delete account"
            confirmValue={accountIdentifier}
            confirmHint={
              <>
                Type <span className="font-mono font-semibold text-foreground">{accountIdentifier}</span> to confirm
              </>
            }
            destructive
            onConfirm={() => onDelete?.()}
          >
            <Button type="button" variant="destructive">
              Delete account
            </Button>
          </ConfirmDialog>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-destructive">
              This action is irreversible
            </p>
            <p className="text-muted-foreground">
              Deleting your account will permanently remove all your data, including
              your profile, projects, and settings. This cannot be undone.
            </p>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
