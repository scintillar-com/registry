import { test, expect } from "@playwright/test"

test.describe("Password Input interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/password-input")
    await page.waitForLoadState("networkidle")
  })

  test("can type a password and see strength indicator update", async ({ page }) => {
    const input = page.locator("input[type='password']").first()
    await input.fill("weakpass")
    // Strength indicator should show a label
    await expect(page.getByText(/Weak|Fair|Good|Strong/).first()).toBeVisible({ timeout: 3000 })
  })

  test("visibility toggle switches input type", async ({ page }) => {
    const input = page.locator("input[type='password']").first()
    await input.fill("mypassword")

    // Click the eye toggle
    const toggle = page.getByLabel(/Show password/i)
    await toggle.click()

    // Input should now be text type
    await expect(page.locator("input[type='text']").first()).toBeVisible()

    // Click again to hide
    const hideToggle = page.getByLabel(/Hide password/i)
    await hideToggle.click()
    await expect(page.locator("input[type='password']").first()).toBeVisible()
  })

  test("keyboard: Tab to toggle, Enter/Space activates", async ({ page }) => {
    const input = page.locator("input[type='password']").first()
    await input.fill("test")
    await input.press("Tab")

    // Focus should be on the toggle button
    await page.keyboard.press("Enter")
    await expect(page.locator("input[type='text']").first()).toBeVisible()
  })
})
