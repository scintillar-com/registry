"use client"

import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function CollapsiblePreview() {
  const [open, setOpen] = useState(false)
  const { values, entries } = useControls({
    disabled: { type: "boolean", default: false },
  })

  return (
    <PreviewLayout controls={entries}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        disabled={values.disabled}
        className="w-72 space-y-2"
      >
        <div className="flex items-center justify-between rounded-md border px-4 py-2">
          <span className="text-sm font-semibold">3 items</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <ChevronsUpDown className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">Item 1</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">Item 2</div>
          <div className="rounded-md border px-4 py-2 text-sm">Item 3</div>
        </CollapsibleContent>
      </Collapsible>
    </PreviewLayout>
  )
}
