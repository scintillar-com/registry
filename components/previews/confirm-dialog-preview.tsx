"use client"

import { ConfirmDialog } from "@/registry/new-york/blocks/confirm-dialog/confirm-dialog"
import { Button } from "@/components/ui/button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function ConfirmDialogPreview() {
  const { values, entries } = useControls({
    mode: {
      type: "select",
      options: ["simple", "input-match"],
      default: "simple",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <ConfirmDialog
        title="Delete project?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {}}
        {...(values.mode === "input-match"
          ? { confirmValue: "my-project" }
          : {})}
      >
        <Button variant="destructive">Delete Project</Button>
      </ConfirmDialog>
    </PreviewLayout>
  )
}
