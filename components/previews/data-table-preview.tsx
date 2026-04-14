"use client"

import { useMemo, useState, useCallback } from "react"
import { DataTable, type DataTableColumn } from "@/registry/new-york/blocks/data-table/data-table"
import {
  SearchFilterBar,
  type FilterDef,
  type ActiveFilter,
} from "@/registry/new-york/blocks/search-filter-bar/search-filter-bar"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

interface Invoice {
  id: string
  status: string
  method: string
  amount: number
}

const data: Invoice[] = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: 150 },
  { id: "INV-003", status: "Overdue", method: "Bank Transfer", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: 450 },
  { id: "INV-005", status: "Pending", method: "PayPal", amount: 550 },
  { id: "INV-006", status: "Paid", method: "Bank Transfer", amount: 120 },
  { id: "INV-007", status: "Overdue", method: "Credit Card", amount: 780 },
  { id: "INV-008", status: "Pending", method: "PayPal", amount: 320 },
  { id: "INV-009", status: "Paid", method: "Credit Card", amount: 190 },
  { id: "INV-010", status: "Paid", method: "Bank Transfer", amount: 670 },
  { id: "INV-011", status: "Overdue", method: "PayPal", amount: 410 },
  { id: "INV-012", status: "Pending", method: "Credit Card", amount: 295 },
  { id: "INV-013", status: "Paid", method: "PayPal", amount: 830 },
  { id: "INV-014", status: "Pending", method: "Bank Transfer", amount: 175 },
  { id: "INV-015", status: "Overdue", method: "Credit Card", amount: 520 },
  { id: "INV-016", status: "Paid", method: "PayPal", amount: 340 },
  { id: "INV-017", status: "Paid", method: "Credit Card", amount: 715 },
  { id: "INV-018", status: "Pending", method: "Bank Transfer", amount: 260 },
  { id: "INV-019", status: "Overdue", method: "PayPal", amount: 445 },
  { id: "INV-020", status: "Paid", method: "Credit Card", amount: 990 },
  { id: "INV-021", status: "Pending", method: "Bank Transfer", amount: 135 },
  { id: "INV-022", status: "Paid", method: "PayPal", amount: 580 },
  { id: "INV-023", status: "Overdue", method: "Credit Card", amount: 365 },
  { id: "INV-024", status: "Pending", method: "Bank Transfer", amount: 820 },
  { id: "INV-025", status: "Paid", method: "PayPal", amount: 210 },
]

const columns: DataTableColumn<Invoice>[] = [
  {
    id: "id",
    header: "Invoice",
    cell: (row) => <span className="font-medium">{row.id}</span>,
    sortValue: (row) => row.id,
    fixed: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => row.status,
    sortValue: (row) => row.status,
  },
  {
    id: "method",
    header: "Method",
    cell: (row) => row.method,
    sortValue: (row) => row.method,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (row) => `$${row.amount.toFixed(2)}`,
    sortValue: (row) => row.amount,
    defaultWidth: 120,
  },
]

const filterDefs: FilterDef[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "Paid", label: "Paid" },
      { value: "Pending", label: "Pending" },
      { value: "Overdue", label: "Overdue" },
    ],
  },
  {
    id: "method",
    label: "Method",
    options: [
      { value: "Credit Card", label: "Credit Card" },
      { value: "PayPal", label: "PayPal" },
      { value: "Bank Transfer", label: "Bank Transfer" },
    ],
  },
]

export function DataTablePreview() {
  const { values, entries } = useControls({
    pagination: { type: "boolean", default: true },
    columnPicker: { type: "boolean", default: true },
    searchBar: { type: "boolean", default: true },
    loading: { type: "boolean", default: false },
  })

  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])

  const filteredData = useMemo(() => {
    let result = data

    // Search
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (row) =>
          row.id.toLowerCase().includes(q) ||
          row.status.toLowerCase().includes(q) ||
          row.method.toLowerCase().includes(q)
      )
    }

    // Filters
    for (const af of activeFilters) {
      if (af.filterId === "status") {
        result = result.filter((row) => row.status === af.value)
      } else if (af.filterId === "method") {
        result = result.filter((row) => row.method === af.value)
      }
    }

    return result
  }, [query, activeFilters])

  const handleColumnVisibility = useCallback((columnId: string) => {
    setHiddenColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    )
  }, [])

  return (
    <PreviewLayout controls={entries}>
      <div className="w-160 space-y-0">
        <DataTable
          tableId="preview"
          columns={columns}
          data={filteredData}
          rowKey={(row) => row.id}
          defaultSortKey="id"
          pagination={values.pagination}
          defaultPageSize={10}
          columnPicker={values.columnPicker}
          defaultHiddenColumns={hiddenColumns}
          onColumnVisibilityChange={handleColumnVisibility}
          loading={values.loading}
          toolbar={
            values.searchBar ? (
              <SearchFilterBar
                query={query}
                onQueryChange={setQuery}
                filters={filterDefs}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                placeholder="Search invoices..."
                className="flex-1"
              />
            ) : undefined
          }
        />
      </div>
    </PreviewLayout>
  )
}
