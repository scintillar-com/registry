import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormulaEditor } from "@/registry/new-york/blocks/formula-editor/formula-editor"

function renderEditor(
  overrides: Partial<React.ComponentProps<typeof FormulaEditor>> = {}
) {
  const onChange = overrides.onChange ?? vi.fn()
  const onBlur = overrides.onBlur ?? vi.fn()
  const result = render(
    <FormulaEditor
      value={overrides.value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      fieldNames={overrides.fieldNames ?? ["Price", "Tax"]}
      fieldTypes={overrides.fieldTypes ?? {}}
      inline
      {...overrides}
    />
  )
  return { onChange, onBlur, ...result }
}

describe("FormulaEditor", () => {
  it("renders textarea with placeholder", () => {
    renderEditor()
    expect(screen.getByPlaceholderText("=add({Price}, {Tax})")).toBeInTheDocument()
  })

  it("value prop controls the textarea content", () => {
    renderEditor({ value: "=add(1, 2)" })
    const textarea = screen.getByPlaceholderText("=add({Price}, {Tax})") as HTMLTextAreaElement
    expect(textarea.value).toBe("=add(1, 2)")
  })

  it("onChange fires on input", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderEditor({ onChange })

    const textarea = screen.getByPlaceholderText("=add({Price}, {Tax})")
    await user.type(textarea, "=")

    expect(onChange).toHaveBeenCalled()
  })

  it("onBlur fires on Escape key", async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    renderEditor({ onBlur })

    const textarea = screen.getByPlaceholderText("=add({Price}, {Tax})")
    await user.click(textarea)
    await user.keyboard("{Escape}")

    expect(onBlur).toHaveBeenCalled()
  })
})
