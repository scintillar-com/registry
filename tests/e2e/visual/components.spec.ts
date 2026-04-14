import { test, expect } from "@playwright/test"

// Components to capture visual snapshots
const components = [
  "accordion", "alert", "avatar", "badge", "breadcrumb", "button",
  "calendar", "card", "checkbox", "collapsible", "color-swatch",
  "command", "data-table", "empty-state", "file-upload",
  "input", "input-otp", "kbd", "label", "live-caret",
  "pagination", "password-input", "radio-group", "select",
  "separator", "skeleton", "social-links", "split-button",
  "table", "tabs", "textarea", "toggle", "user-status",
  // Blocks
  "app-switcher", "auth-login", "confirm-dialog", "form-section",
  "search-filter-bar",
]

test.describe("Visual regression", () => {
  for (const name of components) {
    test(`${name} matches snapshot`, async ({ page }) => {
      // Use the isolated snapshot route — no canvas, no zoom controls, no dots
      await page.goto(`/preview-snapshot/${name}`)
      await page.waitForLoadState("networkidle")

      // Wait for animations to settle
      await page.waitForTimeout(300)

      // Capture just the component via the data-snapshot-target wrapper
      const target = page.locator("[data-snapshot-target]")
      await expect(target).toBeVisible({ timeout: 5000 })
      await expect(target).toHaveScreenshot(`${name}.png`, {
        maxDiffPixelRatio: 0.01,
      })
    })
  }
})
