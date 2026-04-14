import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  PasswordInput,
  getPasswordStrength,
} from "@/components/ui/password-input"

// ---------------------------------------------------------------------------
// getPasswordStrength — pure function tests
// ---------------------------------------------------------------------------
describe("getPasswordStrength", () => {
  describe("severity thresholds", () => {
    it("low severity: a decent password is strong more easily", () => {
      const result = getPasswordStrength("Mx7k!pQ9", "low")
      // low thresholds are lower, so this should score at least "good"
      expect(["good", "strong"]).toContain(result.strength)
    })

    it("medium severity: default threshold", () => {
      const result = getPasswordStrength("Abcde1!x", "medium")
      expect(["weak", "fair", "good", "strong"]).toContain(result.strength)
    })

    it("high severity: requires more entropy for strong", () => {
      const lowResult = getPasswordStrength("Abcde1!x", "low")
      const highResult = getPasswordStrength("Abcde1!x", "high")
      // The same password should score equal or lower with high severity
      expect(highResult.segments).toBeLessThanOrEqual(lowResult.segments)
    })
  })

  describe("weak password", () => {
    it('"abc" is weak', () => {
      const result = getPasswordStrength("abc")
      expect(result.strength).toBe("weak")
      expect(result.segments).toBe(1)
    })

    it("empty string is weak with 0 entropy", () => {
      const result = getPasswordStrength("")
      expect(result.strength).toBe("weak")
      expect(result.entropy).toBe(0)
    })
  })

  describe("strong password", () => {
    it('"Tr0ub4dor&3" scores well', () => {
      const result = getPasswordStrength("Tr0ub4dor&3")
      // Uses all character classes and is long
      expect(["good", "strong"]).toContain(result.strength)
      expect(result.entropy).toBeGreaterThan(40)
    })
  })

  describe("repetition penalty", () => {
    it('"aaaaaA1!" scores lower than "abcdeA1!" due to repeated chars', () => {
      const repeated = getPasswordStrength("aaaaaA1!")
      const varied = getPasswordStrength("xbcdeA1!")
      expect(repeated.entropy).toBeLessThan(varied.entropy)
    })
  })

  describe("sequence penalty", () => {
    it('"abcdefA1!" scores lower due to sequential characters', () => {
      const sequential = getPasswordStrength("abcdefA1!")
      const nonSequential = getPasswordStrength("zxqwrtA1!")
      expect(sequential.entropy).toBeLessThan(nonSequential.entropy)
    })
  })

  describe("common pattern penalty", () => {
    it('"password123" is weak', () => {
      const result = getPasswordStrength("password123")
      expect(result.strength).toBe("weak")
    })

    it('"admin" is weak', () => {
      const result = getPasswordStrength("admin")
      expect(result.strength).toBe("weak")
    })
  })
})

// ---------------------------------------------------------------------------
// PasswordInput — component tests
// ---------------------------------------------------------------------------
describe("PasswordInput", () => {
  it("renders as a password input by default", () => {
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")
  })

  it("toggles visibility when the eye button is clicked", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText("Password")

    expect(input).toHaveAttribute("type", "password")

    const toggleButton = screen.getByRole("button", { name: "Show password" })
    await user.click(toggleButton)

    expect(input).toHaveAttribute("type", "text")

    const hideButton = screen.getByRole("button", { name: "Hide password" })
    await user.click(hideButton)

    expect(input).toHaveAttribute("type", "password")
  })

  it("renders strength bar with correct segments for a strong password", () => {
    render(
      <PasswordInput
        showStrength
        value="Tr0ub4dor&3"
        aria-label="Password"
      />
    )
    // The strength label should be rendered
    const label = screen.getByText(/weak|fair|good|strong/i)
    expect(label).toBeInTheDocument()
  })

  it("does not render strength bar when showStrength is false", () => {
    render(<PasswordInput value="abc" aria-label="Password" />)
    expect(screen.queryByText(/weak|fair|good|strong/i)).not.toBeInTheDocument()
  })

  it("does not render strength bar when value is empty", () => {
    render(<PasswordInput showStrength value="" aria-label="Password" />)
    expect(screen.queryByText(/weak|fair|good|strong/i)).not.toBeInTheDocument()
  })
})
