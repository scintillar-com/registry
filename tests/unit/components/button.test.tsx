import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: "Click me" })
    expect(button).toHaveAttribute("data-variant", "default")
    expect(button).toHaveAttribute("data-size", "default")
  })

  describe("variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const

    for (const variant of variants) {
      it(`renders data-variant="${variant}"`, () => {
        render(<Button variant={variant}>btn</Button>)
        const button = screen.getByRole("button", { name: "btn" })
        expect(button).toHaveAttribute("data-variant", variant)
      })
    }
  })

  describe("sizes", () => {
    const sizes = [
      "default",
      "xs",
      "sm",
      "lg",
      "icon",
      "icon-xs",
      "icon-sm",
      "icon-lg",
    ] as const

    for (const size of sizes) {
      it(`renders data-size="${size}"`, () => {
        render(<Button size={size}>btn</Button>)
        const button = screen.getByRole("button", { name: "btn" })
        expect(button).toHaveAttribute("data-size", size)
      })
    }
  })

  it("has disabled attribute when disabled", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: "Disabled" })
    expect(button).toBeDisabled()
  })

  it("renders child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole("link", { name: "Link Button" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/test")
    // Should NOT render a <button> element
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("fires onClick handler when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole("button", { name: "Click" }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    )
    await user.click(screen.getByRole("button", { name: "Click" }))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
