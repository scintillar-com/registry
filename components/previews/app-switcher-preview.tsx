"use client"

import { useState } from "react"
import { AppSwitcher } from "@/registry/new-york/blocks/app-switcher/app-switcher"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const organizations = [
  {
    id: "org-1",
    name: "Scintillar",
    initials: "SC",
    projects: [
      { id: "proj-1", name: "Dashboard" },
      { id: "proj-2", name: "Analytics" },
    ],
  },
  {
    id: "org-2",
    name: "Personal",
    initials: "ME",
    projects: [
      { id: "proj-3", name: "Blog" },
      { id: "proj-4", name: "Portfolio" },
    ],
  },
]

export function AppSwitcherPreview() {
  const [selectedOrgId, setSelectedOrgId] = useState("org-1")
  const [selectedProjectId, setSelectedProjectId] = useState("proj-1")

  return (
    <PreviewLayout>
      <AppSwitcher
        organizations={organizations}
        selectedOrgId={selectedOrgId}
        selectedProjectId={selectedProjectId}
        onSelect={(orgId, projectId) => {
          setSelectedOrgId(orgId)
          setSelectedProjectId(projectId)
        }}
      />
    </PreviewLayout>
  )
}
