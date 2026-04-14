"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SonnerPreview() {
  return (
    <PreviewLayout>
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2024 at 9:00 AM",
        })
      }
    >
      Show Toast
    </Button>
    </PreviewLayout>
  )
}
