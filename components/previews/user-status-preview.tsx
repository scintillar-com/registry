"use client"

import { UserStatus } from "@/components/ui/user-status"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function UserStatusPreview() {
  const { values, entries } = useControls({
    name: { type: "text", default: "Jane Doe" },
    subtitle: { type: "text", default: "Product Designer" },
    status: {
      type: "select",
      options: ["online", "offline", "busy", "away"],
      default: "online",
    },
    size: {
      type: "select",
      options: ["sm", "default", "lg"],
      default: "default",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <UserStatus
        name={values.name}
        subtitle={values.subtitle}
        status={values.status as "online"}
        size={values.size as "default"}
      />
    </PreviewLayout>
  )
}
