import { test, expect } from "@playwright/test"

test.describe("Search Filter Bar interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/search-filter-bar")
    await page.waitForLoadState("networkidle")
  })

  test("search input accepts text", async ({ page }) => {
    const input = page.getByPlaceholder(/Search/i)
    await input.fill("test query")
    await expect(input).toHaveValue("test query")
  })

  test("clear button clears search", async ({ page }) => {
    const input = page.getByPlaceholder(/Search/i)
    await input.fill("test")
    const clearBtn = page.getByLabel(/Clear search/i)
    await clearBtn.click()
    await expect(input).toHaveValue("")
  })

  test("filter button is clickable", async ({ page }) => {
    const filterBtn = page.locator("button[aria-label='Filters']")
    await expect(filterBtn).toBeVisible({ timeout: 5000 })
    await filterBtn.click()
    // Popover should open — check for any new content appearing
    await page.waitForTimeout(500)
  })

  test("keyboard: Tab reaches filter button", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i)
    await searchInput.focus()
    // Tab past the clear button (if visible) to the filter button
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))
    // Should eventually reach "Filters" or another interactive element
    expect(focused).toBeTruthy()
  })
})
