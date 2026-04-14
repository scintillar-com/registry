import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { renderHook, act } from "@testing-library/react"
import { sortRows, useTableSort } from "@/lib/use-column-widths"
import { DataTable, type DataTableColumn } from "@/registry/new-york/blocks/data-table/data-table"

// ── sortRows ────────────────────────────────────────────────────

describe("sortRows", () => {
  const rows = [
    { name: "Charlie", age: 30 },
    { name: "Alice", age: 25 },
    { name: "Bob", age: 35 },
  ]

  it("sorts ascending by string", () => {
    const sorted = sortRows(rows, "name", "asc", (r) => r.name)
    expect(sorted.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie"])
  })

  it("sorts descending by string", () => {
    const sorted = sortRows(rows, "name", "desc", (r) => r.name)
    expect(sorted.map((r) => r.name)).toEqual(["Charlie", "Bob", "Alice"])
  })

  it("sorts ascending by number", () => {
    const sorted = sortRows(rows, "age", "asc", (r) => r.age)
    expect(sorted.map((r) => r.age)).toEqual([25, 30, 35])
  })

  it("sorts descending by number", () => {
    const sorted = sortRows(rows, "age", "desc", (r) => r.age)
    expect(sorted.map((r) => r.age)).toEqual([35, 30, 25])
  })

  it("returns original order when key is null", () => {
    const sorted = sortRows(rows, null, "asc", (r) => r.name)
    expect(sorted).toEqual(rows)
  })
})

// ── useTableSort ────────────────────────────────────────────────

describe("useTableSort", () => {
  it("toggles between asc and desc for the same key", () => {
    const { result } = renderHook(() => useTableSort<string>("name", "asc"))

    expect(result.current.sortKey).toBe("name")
    expect(result.current.sortDir).toBe("asc")

    act(() => result.current.toggle("name"))
    expect(result.current.sortDir).toBe("desc")

    act(() => result.current.toggle("name"))
    expect(result.current.sortDir).toBe("asc")
  })

  it("resets to asc when switching to a new key", () => {
    const { result } = renderHook(() => useTableSort<string>("name", "asc"))

    act(() => result.current.toggle("name"))
    expect(result.current.sortDir).toBe("desc")

    act(() => result.current.toggle("age"))
    expect(result.current.sortKey).toBe("age")
    expect(result.current.sortDir).toBe("asc")
  })
})

// ── DataTable component ─────────────────────────────────────────

type Row = { id: string; name: string; score: number }

const columns: DataTableColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: "score",
    header: "Score",
    cell: (row) => row.score,
    sortValue: (row) => row.score,
  },
]

const sampleData: Row[] = [
  { id: "1", name: "Alice", score: 90 },
  { id: "2", name: "Bob", score: 85 },
  { id: "3", name: "Charlie", score: 95 },
]

describe("DataTable", () => {
  it("renders column headers", () => {
    render(
      <DataTable
        tableId="test"
        columns={columns}
        data={sampleData}
        rowKey={(r) => r.id}
      />
    )

    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Score")).toBeInTheDocument()
  })

  it("renders rows with data", () => {
    render(
      <DataTable
        tableId="test"
        columns={columns}
        data={sampleData}
        rowKey={(r) => r.id}
      />
    )

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
    expect(screen.getByText("90")).toBeInTheDocument()
  })

  it("shows emptyMessage when data is empty", () => {
    render(
      <DataTable
        tableId="test"
        columns={columns}
        data={[]}
        rowKey={(r) => r.id}
        emptyMessage="Nothing here."
      />
    )

    expect(screen.getByText("Nothing here.")).toBeInTheDocument()
  })

  it("shows skeletons when loading", () => {
    const { container } = render(
      <DataTable
        tableId="test"
        columns={columns}
        data={[]}
        rowKey={(r) => r.id}
        loading
        skeletonRows={3}
      />
    )

    // Skeleton component renders divs with data-slot="skeleton"
    const skeletons = container.querySelectorAll("[data-slot='skeleton']")
    // 2 header skeletons + 3 rows * 2 columns = 8 total
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
  })

  it("pagination shows correct page info", () => {
    render(
      <DataTable
        tableId="test"
        columns={columns}
        data={sampleData}
        rowKey={(r) => r.id}
        pagination
        defaultPageSize={10}
      />
    )

    expect(screen.getByText("1\u20133 of 3")).toBeInTheDocument()
  })
})
