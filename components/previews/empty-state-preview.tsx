"use client"

import { Inbox } from "lucide-react"
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription } from "@/components/ui/empty-state"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"

export function EmptyStatePreview() {
  const { values, entries } = useControls({
    title: { type: "text", default: "No results" },
    description: { type: "text", default: "Try adjusting your search or filters." },
    showIcon: { type: "boolean", default: true },
  })

  return (
    <PreviewLayout controls={entries}>
      <EmptyState className="w-80">
        {values.showIcon && (
          <EmptyStateIcon>
            <Inbox />
          </EmptyStateIcon>
        )}
        <EmptyStateTitle>{values.title}</EmptyStateTitle>
        <EmptyStateDescription>{values.description}</EmptyStateDescription>
      </EmptyState>
    </PreviewLayout>
  )
}
