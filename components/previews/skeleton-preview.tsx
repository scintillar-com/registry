"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SkeletonPreview() {
  const { values, entries } = useControls({
    shape: {
      type: "select",
      options: ["card", "avatar", "text"],
      default: "card",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      {values.shape === "card" && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      )}
      {values.shape === "avatar" && (
        <Skeleton className="h-16 w-16 rounded-full" />
      )}
      {values.shape === "text" && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      )}
    </PreviewLayout>
  )
}
