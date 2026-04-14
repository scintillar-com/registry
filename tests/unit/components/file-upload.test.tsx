import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileUpload } from "@/components/ui/file-upload"

function createFile(
  name: string,
  size: number,
  type = "text/plain"
): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe("FileUpload", () => {
  it("renders drop zone with correct text", () => {
    render(<FileUpload />)
    expect(
      screen.getByText("Drop files here or click to browse")
    ).toBeInTheDocument()
  })

  it("shows 'Any file type' when no accept prop", () => {
    render(<FileUpload />)
    expect(screen.getByText(/Any file type/)).toBeInTheDocument()
  })

  it("shows accepted types in description when accept is provided", () => {
    render(<FileUpload accept="image/*" />)
    expect(screen.getByText(/Accepted: image\/\*/)).toBeInTheDocument()
  })

  it("shows formatted max size in description", () => {
    render(<FileUpload maxSize={1024 * 1024 * 5} />)
    expect(screen.getByText(/Max 5\.0 MB/)).toBeInTheDocument()
  })

  it("shows KB for small maxSize", () => {
    render(<FileUpload maxSize={2048} />)
    expect(screen.getByText(/Max 2\.0 KB/)).toBeInTheDocument()
  })

  it("selects a file via the hidden input", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = createFile("test.txt", 100)

    await user.upload(input, file)

    expect(onFilesChange).toHaveBeenCalledTimes(1)
    expect(onFilesChange).toHaveBeenCalledWith([file])
    // File name should appear in the list
    expect(screen.getByText("test.txt")).toBeInTheDocument()
  })

  it("removes a file when the remove button is clicked", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = createFile("remove-me.txt", 50)
    await user.upload(input, file)

    expect(screen.getByText("remove-me.txt")).toBeInTheDocument()

    const removeButton = screen.getByRole("button", {
      name: "Remove remove-me.txt",
    })
    await user.click(removeButton)

    expect(screen.queryByText("remove-me.txt")).not.toBeInTheDocument()
    // onFilesChange called with empty array on removal
    expect(onFilesChange).toHaveBeenLastCalledWith([])
  })

  it("rejects a file exceeding maxSize", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUpload maxSize={100} onFilesChange={onFilesChange} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const oversizedFile = createFile("big.txt", 200)

    await user.upload(input, oversizedFile)

    // Should show an error
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("alert").textContent).toContain("big.txt")
    expect(screen.getByRole("alert").textContent).toContain("exceeds")
    // onFilesChange should NOT have been called with the oversized file
    expect(onFilesChange).not.toHaveBeenCalled()
  })

  it("allows multiple files when multiple is true", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUpload multiple onFilesChange={onFilesChange} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file1 = createFile("a.txt", 10)
    const file2 = createFile("b.txt", 20)

    await user.upload(input, [file1, file2])

    expect(screen.getByText("a.txt")).toBeInTheDocument()
    expect(screen.getByText("b.txt")).toBeInTheDocument()
    expect(onFilesChange).toHaveBeenCalledWith([file1, file2])
  })

  it("only keeps last file when multiple is false", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file1 = createFile("first.txt", 10)
    await user.upload(input, file1)

    expect(screen.getByText("first.txt")).toBeInTheDocument()

    const file2 = createFile("second.txt", 20)
    await user.upload(input, file2)

    // Without multiple, only the latest file should be present
    expect(screen.getByText("second.txt")).toBeInTheDocument()
  })
})
