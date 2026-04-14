"use client"

import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function AlertPreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["default", "destructive"],
      default: "default",
    },
    title: { type: "text", default: "Heads up!" },
    description: { type: "text", default: "You can add components to your app using the CLI." },
  })

  return (
    <PreviewLayout controls={entries}>
      <Alert variant={values.variant as "default"} className="w-80">
        {values.variant === "destructive" ? (
          <AlertCircle className="size-4" />
        ) : (
          <Info className="size-4" />
        )}
        <AlertTitle>{values.title}</AlertTitle>
        <AlertDescription>{values.description}</AlertDescription>
      </Alert>
    </PreviewLayout>
  )
}
