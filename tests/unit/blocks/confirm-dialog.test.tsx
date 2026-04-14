import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ConfirmDialog } from "@/registry/new-york/blocks/confirm-dialog/confirm-dialog"

function renderDialog(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onConfirm = props.onConfirm ?? vi.fn()
  render(
    <ConfirmDialog
      title="Delete project"
      description="This action cannot be undone."
      onConfirm={onConfirm}
      {...props}
    >
      <button>Delete</button>
    </ConfirmDialog>
  )
  return { onConfirm }
}

describe("ConfirmDialog", () => {
  it("renders the trigger button", () => {
    renderDialog()
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  })

  it("opens the dialog when the trigger is clicked", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Delete" }))

    expect(screen.getByText("Delete project")).toBeInTheDocument()
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument()
  })

  describe("simple mode (no confirmValue)", () => {
    it("confirm button is enabled and clicking it calls onConfirm", async () => {
      const user = userEvent.setup()
      const { onConfirm } = renderDialog()

      await user.click(screen.getByRole("button", { name: "Delete" }))

      const confirmBtn = screen.getByRole("button", { name: "Confirm" })
      expect(confirmBtn).toBeEnabled()

      await user.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe("input-match mode", () => {
    it("confirm button is disabled until the exact value is typed", async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      renderDialog({ confirmValue: "my-project", onConfirm })

      await user.click(screen.getByRole("button", { name: "Delete" }))

      const confirmBtn = screen.getByRole("button", { name: "Confirm" })
      expect(confirmBtn).toBeDisabled()

      const input = screen.getByPlaceholderText("my-project")
      await user.type(input, "my-project")

      expect(confirmBtn).toBeEnabled()
      await user.click(confirmBtn)
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it("typing a wrong value keeps the confirm button disabled", async () => {
      const user = userEvent.setup()
      renderDialog({ confirmValue: "my-project" })

      await user.click(screen.getByRole("button", { name: "Delete" }))

      const input = screen.getByPlaceholderText("my-project")
      await user.type(input, "wrong-value")

      expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled()
    })
  })

  it("cancel button closes the dialog", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByText("Delete project")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.queryByText("Delete project")).not.toBeInTheDocument()
  })

  it("Escape key closes the dialog", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByText("Delete project")).toBeInTheDocument()

    await user.keyboard("{Escape}")

    expect(screen.queryByText("Delete project")).not.toBeInTheDocument()
  })
})
