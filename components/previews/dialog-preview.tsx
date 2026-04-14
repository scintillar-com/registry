"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function DialogPreview() {
  const { values, entries } = useControls({
    title: { type: "text", default: "Dialog Title" },
    description: { type: "text", default: "This is a dialog description." },
  })

  return (
    <PreviewLayout controls={entries}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{values.title}</DialogTitle>
            <DialogDescription>{values.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </PreviewLayout>
  )
}
