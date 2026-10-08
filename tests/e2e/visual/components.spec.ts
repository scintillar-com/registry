import { test, expect } from "@playwright/test"
import { getAllNavigableNames } from "../_components"

/**
 * Components excluded from visual regression:
 *   - Overlay primitives that render nothing meaningful at rest (popover,
 *     tooltip, dialog, sheet, dropdown-menu, context-menu, sonner).
 *   - Blocks whose snapshots are flaky by design (auth-register,
 *     authorized-devices, the account, email, MFA, org, profile and
 *     password-reset forms, and live-cursor, which animates).
 *   - backdrop and sidebar (full-viewport components that don't fit the
 *     isolated snapshot container).
 *   - color-picker and formula-editor, which have no baseline yet.
 * Together this is the set the suite covered before it read registry.json:
 * every remaining component has a committed snapshot.
 */
const EXCLUDE = new Set([
  "account-deletion-form",
  "auth-register",
  "authorized-devices",
  "backdrop",
  "color-picker",
  "context-menu",
  "dialog",
  "dropdown-menu",
  "email-update-form",
  "formula-editor",
  "live-cursor",
  "mfa-form",
  "org-members-form",
  "org-roles-form",
  "org-settings-form",
  "password-reset-form",
  "popover",
  "profile-form",
  "sheet",
  "sidebar",
  "sonner",
  "tooltip",
])

const components = getAllNavigableNames().filter((n) => !EXCLUDE.has(n))

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
