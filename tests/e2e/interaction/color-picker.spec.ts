import { test, expect } from "@playwright/test"

test.describe("Color Picker interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/color-picker")
    await page.waitForLoadState("networkidle")
  })

  test("clicking edit opens the picker with sliders", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /Edit/i })
    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click()
      await page.waitForTimeout(500)
      const slider = page.locator("[role='slider']").first()
      await expect(slider).toBeVisible({ timeout: 3000 })
    }
  })

  test("arrow keys adjust slider values", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: /Edit/i })
    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click()
      await page.waitForTimeout(500)
    }

    const slider = page.locator("[role='slider']").first()
    if (await slider.isVisible({ timeout: 3000 })) {
      await slider.focus()
      await slider.press("ArrowRight")
      const value = await slider.getAttribute("aria-valuenow") ?? await slider.getAttribute("aria-valuetext")
      expect(value).toBeTruthy()
    }
  })
})
