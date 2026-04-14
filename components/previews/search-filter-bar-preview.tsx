"use client"

import { useState } from "react"
import {
  SearchFilterBar,
  type FilterDef,
  type ActiveFilter,
} from "@/registry/new-york/blocks/search-filter-bar/search-filter-bar"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const sampleFilters: FilterDef[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    id: "role",
    label: "Role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
      { value: "editor", label: "Editor" },
    ],
  },
  {
    id: "team",
    label: "Team",
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "design", label: "Design" },
      { value: "marketing", label: "Marketing" },
    ],
  },
]

export function SearchFilterBarPreview() {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  return (
    <PreviewLayout>
      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        filters={sampleFilters}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />
    </PreviewLayout>
  )
}
