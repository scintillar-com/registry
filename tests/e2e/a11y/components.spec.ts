import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { getAllNavigableNames } from "../_components"

const components = getAllNavigableNames()

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
