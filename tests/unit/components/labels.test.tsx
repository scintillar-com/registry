import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PasswordInput } from "@/components/ui/password-input"
import { FileUpload } from "@/components/ui/file-upload"
import {
  SearchFilterBar,
  type FilterDef,
} from "@/registry/new-york/blocks/search-filter-bar/search-filter-bar"

// ---------------------------------------------------------------------------
// PasswordInput — labels prop
// ---------------------------------------------------------------------------
describe("PasswordInput labels", () => {
  it("renders default strength label", () => {
    render(
      <PasswordInput showStrength value="abc" aria-label="Password" />
    )
    expect(screen.getByText("Weak")).toBeInTheDocument()
  })

  it("renders custom strength label when overridden", () => {
    render(
      <PasswordInput
        showStrength
        value="abc"
        aria-label="Password"
        labels={{ weak: "Débil" }}
      />
    )
    expect(screen.getByText("Débil")).toBeInTheDocument()
    expect(screen.queryByText("Weak")).not.toBeInTheDocument()
  })

  it("renders custom aria-label for toggle button", () => {
    render(
      <PasswordInput
        aria-label="Password"
        labels={{ showPassword: "Afficher" }}
      />
    )
    expect(
      screen.getByRole("button", { name: "Afficher" })
    ).toBeInTheDocument()
  })

  it("uses custom hidePassword label after toggling visibility", async () => {
    const user = userEvent.setup()
    render(
      <PasswordInput
        aria-label="Password"
        labels={{ showPassword: "Mostrar", hidePassword: "Ocultar" }}
      />
    )

    await user.click(screen.getByRole("button", { name: "Mostrar" }))
    expect(
      screen.getByRole("button", { name: "Ocultar" })
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// FileUpload — labels prop
// ---------------------------------------------------------------------------
describe("FileUpload labels", () => {
  it("renders default drop text", () => {
    render(<FileUpload />)
    expect(
      screen.getByText("Drop files here or click to browse")
    ).toBeInTheDocument()
  })

  it("renders custom drop text when overridden", () => {
    render(<FileUpload labels={{ dropText: "Déposez ici" }} />)
    expect(screen.getByText("Déposez ici")).toBeInTheDocument()
    expect(
      screen.queryByText("Drop files here or click to browse")
    ).not.toBeInTheDocument()
  })

  it("renders custom anyFileType label", () => {
    render(<FileUpload labels={{ anyFileType: "Tous les fichiers" }} />)
    expect(screen.getByText("Tous les fichiers")).toBeInTheDocument()
  })

  it("renders custom acceptedPrefix label", () => {
    render(
      <FileUpload
        accept="image/*"
        labels={{ acceptedPrefix: "Accepté: " }}
      />
    )
    expect(screen.getByText(/Accepté: image\/\*/)).toBeInTheDocument()
  })

  it("renders custom maxSizePrefix label", () => {
    render(
      <FileUpload
        maxSize={1024 * 1024 * 5}
        labels={{ maxSizePrefix: "Máximo " }}
      />
    )
    expect(screen.getByText(/Máximo 5\.0 MB/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// SearchFilterBar — labels prop
// ---------------------------------------------------------------------------
const FILTERS: FilterDef[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
]

describe("SearchFilterBar labels", () => {
  it("renders without errors with partial labels", () => {
    render(
      <SearchFilterBar
        query=""
        onQueryChange={vi.fn()}
        filters={FILTERS}
        activeFilters={[]}
        onFiltersChange={vi.fn()}
        labels={{ clearAll: "Tout effacer" }}
      />
    )
    // Should not throw — component mounts successfully
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("renders custom clearAll label", () => {
    render(
      <SearchFilterBar
        query=""
        onQueryChange={vi.fn()}
        filters={FILTERS}
        activeFilters={[{ filterId: "status", value: "active" }]}
        onFiltersChange={vi.fn()}
        labels={{ clearAll: "Tout effacer" }}
      />
    )
    expect(screen.getByText("Tout effacer")).toBeInTheDocument()
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument()
  })

  it("renders custom addFilter label in popover", async () => {
    const user = userEvent.setup()
    render(
      <SearchFilterBar
        query=""
        onQueryChange={vi.fn()}
        filters={FILTERS}
        activeFilters={[]}
        onFiltersChange={vi.fn()}
        labels={{ addFilter: "Ajouter un filtre" }}
      />
    )

    await user.click(screen.getByRole("button", { name: "Filters" }))
    expect(screen.getByText("Ajouter un filtre")).toBeInTheDocument()
  })
})
