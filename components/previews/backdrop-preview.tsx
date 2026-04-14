"use client"

import { useState } from "react"
import { Backdrop } from "@/components/ui/backdrop"
import { Button } from "@/components/ui/button"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"

export function BackdropPreview() {
  const [open, setOpen] = useState(false)
  const { values, entries } = useControls({
    belowHeader: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show Backdrop
      </Button>
      {open && (
        <Backdrop
          belowHeader={values.belowHeader}
          onClick={() => setOpen(false)}
        />
      )}
    </PreviewLayout>
  )
}
