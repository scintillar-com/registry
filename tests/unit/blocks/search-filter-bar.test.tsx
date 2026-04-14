import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
import {
  SearchFilterBar,
  type FilterDef,
  type ActiveFilter,
} from "@/registry/new-york/blocks/search-filter-bar/search-filter-bar"

const FILTERS: FilterDef[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    options: [
      { value: "high", label: "High" },
      { value: "low", label: "Low" },
    ],
  },
]

function renderBar(overrides: Partial<React.ComponentProps<typeof SearchFilterBar>> = {}) {
  const onQueryChange = overrides.onQueryChange ?? vi.fn()
  const onFiltersChange = overrides.onFiltersChange ?? vi.fn()
  const result = render(
    <SearchFilterBar
      query={overrides.query ?? ""}
      onQueryChange={onQueryChange}
      filters={overrides.filters ?? FILTERS}
      activeFilters={overrides.activeFilters ?? []}
      onFiltersChange={onFiltersChange}
      placeholder={overrides.placeholder ?? "Search items..."}
      {...overrides}
    />
  )
  return { onQueryChange, onFiltersChange, ...result }
}

describe("SearchFilterBar", () => {
  it("renders search input with placeholder", () => {
    renderBar({ placeholder: "Find something..." })
    expect(screen.getByPlaceholderText("Find something...")).toBeInTheDocument()
  })

  describe("search trigger behavior", () => {
    it("does not fire onQueryChange while typing below minChars (default 3)", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, debounceMs: 50 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "ab")
      // Wait well past the debounce window — "ab" is below the 3-char threshold
      await sleep(150)

      expect(onQueryChange).not.toHaveBeenCalled()
    })

    it("fires onQueryChange after debounce when typing reaches minChars", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, debounceMs: 50 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "abc")

      await waitFor(() => {
        expect(onQueryChange).toHaveBeenCalledWith("abc")
      })
    })

    it("debounces rapid typing — only fires once with final value", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, debounceMs: 100 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "abc")
      await user.type(input, "def")
      await user.type(input, "ghi")

      await waitFor(() => {
        expect(onQueryChange).toHaveBeenCalledWith("abcdefghi")
      })
      // Should be a single committed value (the last one) — not 9 separate fires
      const finalCalls = onQueryChange.mock.calls.filter((c) => c[0] === "abcdefghi")
      expect(finalCalls.length).toBe(1)
    })

    it("respects custom minChars threshold", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, minChars: 5, debounceMs: 50 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "abcd")
      await sleep(150)
      expect(onQueryChange).not.toHaveBeenCalled()

      await user.type(input, "e")
      await waitFor(() => {
        expect(onQueryChange).toHaveBeenCalledWith("abcde")
      })
    })

    it("commits immediately on Enter regardless of minChars", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, debounceMs: 1000 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "ab")
      onQueryChange.mockClear()
      await user.keyboard("{Enter}")

      // Enter commits immediately even though "ab" is below minChars
      // and the long debounce hasn't elapsed
      expect(onQueryChange).toHaveBeenCalledWith("ab")
    })

    it("commits immediately on blur regardless of minChars", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, debounceMs: 1000 })

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "ab")
      onQueryChange.mockClear()
      // Tab away to blur
      await user.tab()

      expect(onQueryChange).toHaveBeenCalledWith("ab")
    })

    it("clear button commits an empty string immediately", async () => {
      const user = userEvent.setup()
      const onQueryChange = vi.fn()
      renderBar({ onQueryChange, query: "previous", debounceMs: 1000 })

      // Click the X clear button
      const clearBtn = screen.getByRole("button", { name: "Clear search" })
      await user.click(clearBtn)

      expect(onQueryChange).toHaveBeenCalledWith("")
    })
  })

  it("filter button opens popover with 'Add filter' heading", async () => {
    const user = userEvent.setup()
    renderBar()

    const filterBtn = screen.getByRole("button", { name: "Filters" })
    await user.click(filterBtn)

    expect(screen.getByText("Add filter")).toBeInTheDocument()
  })

  it("active filter badge renders with correct label and value", () => {
    const activeFilters: ActiveFilter[] = [
      { filterId: "status", value: "active" },
    ]
    renderBar({ activeFilters })

    expect(screen.getByText("Status:")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("removing a filter via X button calls onFiltersChange", async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    const activeFilters: ActiveFilter[] = [
      { filterId: "status", value: "active" },
    ]
    renderBar({ activeFilters, onFiltersChange })

    const removeBtn = screen.getByRole("button", { name: "Remove Status filter" })
    await user.click(removeBtn)

    expect(onFiltersChange).toHaveBeenCalledWith([])
  })

  it("'Clear all' removes all filters", async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    const activeFilters: ActiveFilter[] = [
      { filterId: "status", value: "active" },
      { filterId: "priority", value: "high" },
    ]
    renderBar({ activeFilters, onFiltersChange })

    const clearBtn = screen.getByText("Clear all")
    await user.click(clearBtn)

    expect(onFiltersChange).toHaveBeenCalledWith([])
  })
})
