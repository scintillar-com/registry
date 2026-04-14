"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SheetPreview() {
  const { values, entries } = useControls({
    side: {
      type: "select",
      options: ["right", "left", "top", "bottom"],
      default: "right",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side={values.side as "right"}>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>
              This is a sheet panel that slides in from the side.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </PreviewLayout>
  )
}
