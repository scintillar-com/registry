"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"

/** A filter definition. */
export interface FilterDef {
  /** Unique filter ID. */
  id: string
  /** Display label. */
  label: string
  /** Available options for this filter. */
  options: { value: string; label: string }[]
}

/** An active filter with a selected value. */
export interface ActiveFilter {
  /** Filter definition ID. */
  filterId: string
  /** Selected option value. */
  value: string
}

export interface SearchFilterBarLabels {
  addFilter: string
  allFiltersActive: string
  clearAll: string
  clearSearchAria: string
  filtersAria: string
  /** Aria label for the per-filter remove button. Receives the filter's display label. */
  removeFilterAria: (filterLabel: string) => string
  /** Placeholder for the inline filter-value select. Receives the filter's display label. */
  selectFilterPlaceholder: (filterLabel: string) => string
}

const defaultLabels: SearchFilterBarLabels = {
  addFilter: "Add filter",
  allFiltersActive: "All filters are active.",
  clearAll: "Clear all",
  clearSearchAria: "Clear search",
  filtersAria: "Filters",
  removeFilterAria: (label) => `Remove ${label} filter`,
  selectFilterPlaceholder: (label) => `Select ${label.toLowerCase()}...`,
}

export interface SearchFilterBarProps {
  /** Placeholder text for the search input. */
  placeholder?: string
  /** Current search query. */
  query: string
  /** Called when the search query changes (after debounce / min char check). */
  onQueryChange: (query: string) => void
  /** Available filter definitions. */
  filters: FilterDef[]
  /** Currently active filters. */
  activeFilters: ActiveFilter[]
  /** Called when filters change. */
  onFiltersChange: (filters: ActiveFilter[]) => void
  /**
   * Debounce delay in ms before firing onQueryChange while the user types.
   * Set to 0 to disable debounce. Defaults to 300ms.
   */
  debounceMs?: number
  /**
   * Minimum number of characters required before debounced onQueryChange fires.
   * Pressing Enter or blurring the field always commits regardless. Defaults to 3.
   */
  minChars?: number
  /** Additional CSS classes. */
  className?: string
  /** Override internal labels for localization. */
  labels?: Partial<SearchFilterBarLabels>
}

/**
 * A search bar with a filter button that opens a popover for adding filters.
 * Active filters are shown as dismissible badges below the search input.
 * Each badge can be edited inline via a select dropdown.
 */
export function SearchFilterBar({
  placeholder = "Search...",
  query,
  onQueryChange,
  filters,
  activeFilters,
  onFiltersChange,
  debounceMs = 300,
  minChars = 3,
  className,
  labels,
}: SearchFilterBarProps) {
  const l = { ...defaultLabels, ...labels }
  const [filterOpen, setFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Local input state — what's currently typed in the field.
  // Diverges from `query` until commit (debounce, Enter, or blur).
  const [inputValue, setInputValue] = useState(query)
  const onQueryChangeRef = useRef(onQueryChange)
  useEffect(() => { onQueryChangeRef.current = onQueryChange }, [onQueryChange])

  // Sync local input when parent query changes externally (e.g. clear button)
  useEffect(() => {
    setInputValue(query)
  }, [query])

  // Debounced commit while typing
  useEffect(() => {
    if (inputValue === query) return
    // Empty string always commits immediately (clears search)
    if (inputValue === "") {
      onQueryChangeRef.current("")
      return
    }
    // Below min chars: don't fire — but if user had a previous query, clear it
    if (inputValue.length < minChars) {
      if (query !== "") onQueryChangeRef.current("")
      return
    }
    const id = setTimeout(() => {
      onQueryChangeRef.current(inputValue)
    }, debounceMs)
    return () => clearTimeout(id)
  }, [inputValue, query, debounceMs, minChars])

  // Commit immediately (Enter or blur)
  function commit() {
    if (inputValue !== query) onQueryChangeRef.current(inputValue)
  }

  const addFilter = useCallback(
    (filterId: string, value: string) => {
      const existing = activeFilters.findIndex((f) => f.filterId === filterId)
      if (existing >= 0) {
        const next = [...activeFilters]
        next[existing] = { filterId, value }
        onFiltersChange(next)
      } else {
        onFiltersChange([...activeFilters, { filterId, value }])
      }
    },
    [activeFilters, onFiltersChange]
  )

  const removeFilter = useCallback(
    (filterId: string) => {
      onFiltersChange(activeFilters.filter((f) => f.filterId !== filterId))
    },
    [activeFilters, onFiltersChange]
  )

  const updateFilter = useCallback(
    (filterId: string, value: string) => {
      onFiltersChange(
        activeFilters.map((f) =>
          f.filterId === filterId ? { ...f, value } : f
        )
      )
    },
    [activeFilters, onFiltersChange]
  )

  // Filters not yet active
  const availableFilters = filters.filter(
    (f) => !activeFilters.some((af) => af.filterId === f.id)
  )

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commit()
              }
            }}
            placeholder={placeholder}
            className="pl-9"
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
                setInputValue("")
                onQueryChange("")
                inputRef.current?.focus()
              }}
              aria-label={l.clearSearchAria}
            >
              <X />
            </Button>
          )}
        </div>

        {/* Filter button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilters.length > 0 ? "default" : "outline"}
              size="icon"
              aria-label={l.filtersAria}
            >
              <Filter className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <p className="text-sm font-semibold mb-2">{l.addFilter}</p>
            {availableFilters.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {l.allFiltersActive}
              </p>
            ) : (
              <div className="space-y-1.5">
                {availableFilters.map((filter) => (
                  <div key={filter.id} className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {filter.label}
                    </label>
                    <Select
                      onValueChange={(value) => {
                        addFilter(filter.id, value)
                        setFilterOpen(false)
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={l.selectFilterPlaceholder(filter.label)} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map((af) => {
            const def = filters.find((f) => f.id === af.filterId)
            if (!def) return null
            const currentLabel = def.options.find((o) => o.value === af.value)?.label ?? af.value

            return (
              <Badge
                key={af.filterId}
                variant="secondary"
                className="gap-1 pl-2 pr-1 py-0.5"
              >
                {/* Click the label to change the value via a dropdown menu —
                    the X stays a separate button so it's not part of the menu trigger. */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer rounded-sm hover:bg-muted/40 transition-colors -my-0.5 py-0.5">
                    <span className="text-muted-foreground text-[10px]">
                      {def.label}:
                    </span>
                    <span className="text-xs font-medium">{currentLabel}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-32">
                    <DropdownMenuRadioGroup
                      value={af.value}
                      onValueChange={(v) => updateFilter(af.filterId, v)}
                    >
                      {def.options.map((o) => (
                        <DropdownMenuRadioItem key={o.value} value={o.value} className="text-xs">
                          {o.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={() => removeFilter(af.filterId)}
                  className="rounded-sm p-0.5 hover:bg-muted transition-colors cursor-pointer"
                  aria-label={l.removeFilterAria(def.label)}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )
          })}
          <button
            onClick={() => onFiltersChange([])}
            className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-1"
          >
            {l.clearAll}
          </button>
        </div>
      )}
    </div>
  )
}
