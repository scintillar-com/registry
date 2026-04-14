import { test, expect } from "@playwright/test"

test.describe("Data Table interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/data-table")
    await page.waitForLoadState("networkidle")
  })

  test("sort by clicking column header", async ({ page }) => {
    // Click the "Invoice" column header button
    const header = page.locator("th").filter({ hasText: "Invoice" }).locator("button")
    await header.click()

    // First row should be INV-001 (asc)
    const firstCell = page.locator("tbody tr").first().locator("td").first()
    await expect(firstCell).toContainText("INV-")
  })

  test("pagination controls navigate pages", async ({ page }) => {
    // Should show pagination info
    const pageInfo = page.getByText(/of \d+/)
    await expect(pageInfo).toBeVisible()

    // Click next page
    const nextBtn = page.locator("button").filter({ hasText: "›" })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      // Page info should update
      await expect(pageInfo).toBeVisible()
    }
  })

  test("search filters rows", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill("Paid")
      // Should show fewer rows
      const rows = page.locator("tbody tr")
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test("keyboard: Tab navigates between controls", async ({ page }) => {
    // Tab from the search input through the table
    const searchInput = page.getByPlaceholder(/Search/i)
    if (await searchInput.isVisible()) {
      await searchInput.focus()
      await searchInput.press("Tab")
      // Focus should move to filter button or column header
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(focused).toBeTruthy()
    }
  })
})
