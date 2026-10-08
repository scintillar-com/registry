import fs from "node:fs"
import path from "node:path"

interface RegistryItem {
  name: string
  type: string
}

/**
 * Read the component list from registry.json so e2e specs don't hardcode
 * names; adding a component to registry.json automatically enrolls it in
 * the a11y + visual suites. Accepts both shadcn type names:
 *   - `registry:component` (historically used here)
 *   - `registry:ui` (newer shadcn convention)
 */
function loadRegistry(): RegistryItem[] {
  const p = path.resolve(__dirname, "../../registry.json")
  const raw = JSON.parse(fs.readFileSync(p, "utf8")) as { items: RegistryItem[] }
  return raw.items
}

export function getUiComponentNames(): string[] {
  return loadRegistry()
    .filter((i) => i.type === "registry:ui" || i.type === "registry:component")
    .map((i) => i.name)
    .sort()
}

export function getBlockNames(): string[] {
  return loadRegistry()
    .filter((i) => i.type === "registry:block")
    .map((i) => i.name)
    .sort()
}

/**
 * True when the item has a preview in `components/previews/`. The shell only
 * builds a `/components/<name>` page for items with a preview, so items
 * without one (`hello-world`, `example-form`) have no page to test.
 */
function hasPreview(name: string): boolean {
  return fs.existsSync(path.resolve(__dirname, `../../components/previews/${name}-preview.tsx`))
}

/**
 * Every component and block that has a page: the a11y suite runs on each
 * of them, and the visual suite on all but its exclusions.
 */
export function getAllNavigableNames(): string[] {
  return [...getUiComponentNames(), ...getBlockNames()].filter(hasPreview).sort()
}
