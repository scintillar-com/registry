import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// All component pages to test
const components = [
  "accordion", "alert", "avatar", "backdrop", "badge", "breadcrumb", "button",
  "calendar", "card", "checkbox", "collapsible", "color-picker", "color-swatch",
  "command", "context-menu", "data-table", "dialog", "dropdown-menu",
  "empty-state", "file-upload", "formula-editor", "input", "input-otp",
  "kbd", "label", "live-caret", "live-cursor", "pagination", "password-input",
  "popover", "radio-group", "search-filter-bar", "select", "separator",
  "sheet", "sidebar", "skeleton", "social-links", "sonner", "split-button",
  "table", "tabs", "textarea", "toggle", "tooltip", "user-status",
  // Blocks
  "account-deletion-form", "app-switcher", "auth-login", "auth-register",
  "authorized-devices", "confirm-dialog", "email-update-form", "form-section",
  "mfa-form", "password-reset-form", "profile-form",
]

test.describe("Accessibility audit", () => {
  for (const name of components) {
    test(`${name} has no a11y violations`, async ({ page }) => {
      await page.goto(`/components/${name}`)
      await page.waitForLoadState("networkidle")

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .exclude("[data-slot='preview-canvas']") // Exclude canvas dots (decorative)
        .analyze()

      expect(results.violations).toEqual([])
    })
  }
})
