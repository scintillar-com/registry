"use client"

import { Heart, Plus, Mail, Trash2, Settings, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  none: () => null,
  Heart,
  Plus,
  Mail,
  Trash2,
  Settings,
  Download,
}

export function ButtonPreview() {
  const { values, entries } = useControls({
    label: { type: "text", default: "Button" },
    variant: {
      type: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
      default: "default",
    },
    size: {
      type: "select",
      options: ["default", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
      default: "default",
    },
    icon: {
      type: "select",
      options: ["none", "Heart", "Plus", "Mail", "Trash2", "Settings", "Download"],
      default: "none",
    },
    disabled: { type: "boolean", default: false },
  })

  const Icon = icons[values.icon]
  const isIconOnly = values.size.startsWith("icon")

  return (
    <PreviewLayout controls={entries}>
      <Button
        variant={values.variant as "default"}
        size={values.size as "default"}
        disabled={values.disabled}
        aria-label={isIconOnly ? values.label : undefined}
      >
        {Icon && values.icon !== "none" && <Icon />}
        {!isIconOnly && values.label}
      </Button>
    </PreviewLayout>
  )
}
