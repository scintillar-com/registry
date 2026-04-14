"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function CardPreview() {
  const { values, entries } = useControls({
    title: { type: "text", default: "Card Title" },
    description: { type: "text", default: "A short description of the card content." },
    showFooter: { type: "boolean", default: true },
  })

  return (
    <PreviewLayout controls={entries}>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>{values.title}</CardTitle>
          <CardDescription>{values.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is an example card component with header, content, and footer
            sections.
          </p>
        </CardContent>
        {values.showFooter && (
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        )}
      </Card>
    </PreviewLayout>
  )
}
