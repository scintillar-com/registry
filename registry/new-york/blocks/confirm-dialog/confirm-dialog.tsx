"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../../../components/ui/dialog"

export interface ConfirmDialogProps {
  /** The trigger element that opens the dialog. */
  children: React.ReactNode
  /** Dialog title. */
  title: string
  /** Dialog description explaining the action. */
  description: string
  /** Label for the confirm button. */
  confirmLabel?: string
  /** Label for the cancel button. */
  cancelLabel?: string
  /** Called when the user confirms the action. */
  onConfirm: () => void
  /** Use destructive styling for dangerous actions. */
  destructive?: boolean
  /** If set, the user must type this exact value to confirm (e.g., project name). */
  confirmValue?: string
  /** Hint text shown above the confirmation input (e.g., "Type the project name to confirm"). */
  confirmHint?: React.ReactNode
  /** Whether the confirm action is loading. */
  loading?: boolean
}

/**
 * A confirmation dialog for dangerous or irreversible actions.
 * Supports simple confirmation or input-match confirmation where the user
 * must type a specific value (e.g., project name) to proceed.
 */
export function ConfirmDialog({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = true,
  confirmValue,
  confirmHint,
  loading = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const needsInput = !!confirmValue
  const canConfirm = needsInput ? inputValue === confirmValue : true

  function handleConfirm() {
    onConfirm()
    setOpen(false)
    setInputValue("")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setInputValue("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            {destructive && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
            )}
            <div className="space-y-1.5">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {needsInput && (
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-input" className="text-sm">
              {confirmHint ?? (
                <>
                  Type <span className="font-mono font-semibold text-foreground">{confirmValue}</span> to confirm
                </>
              )}
            </Label>
            <Input
              id="confirm-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmValue}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? "..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
